const Listing = require('../models/Listing');
const { CATEGORIES, CONDITIONS, STATUSES } = Listing;
const AppError = require('../utils/AppError');
const { cleanupImages, destroyImage, uploadImage } = require('../services/cloudinary');

function getString(value) {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function parsePage(value) {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? Math.min(page, 100000) : 1;
}

function parseLimit(value) {
  const limit = Number.parseInt(value, 10);
  return Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 12;
}

function parsePriceCents(value) {
  const priceCents = Number(value);

  if (!Number.isInteger(priceCents) || priceCents < 0) {
    throw new AppError('Price must be a non-negative whole number of cents.', 400);
  }

  return priceCents;
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => (item == null ? [] : [String(item)]));
  }

  return value == null || value === '' ? [] : [String(value)];
}

function parseListingFields(body = {}, { partial = false } = {}) {
  const fields = {};
  const has = (field) => Object.prototype.hasOwnProperty.call(body, field);

  if (!partial || has('title')) {
    const title = getString(body.title);
    if (!title || title.length > 120) {
      throw new AppError('Title is required and must be 120 characters or fewer.', 400);
    }
    fields.title = title;
  }

  if (!partial || has('description')) {
    const description = getString(body.description);
    if (description.length > 3000) {
      throw new AppError('Description must be 3000 characters or fewer.', 400);
    }
    fields.description = description;
  }

  if (!partial || has('priceCents')) {
    fields.priceCents = parsePriceCents(body.priceCents);
  }

  if (!partial || has('category')) {
    const category = getString(body.category).toLowerCase();
    if (!CATEGORIES.includes(category)) {
      throw new AppError('Please choose a valid category.', 400);
    }
    fields.category = category;
  }

  if (!partial || has('size')) {
    const size = getString(body.size);
    if (!size || size.length > 30) {
      throw new AppError('Size is required and must be 30 characters or fewer.', 400);
    }
    fields.size = size;
  }

  if (!partial || has('condition')) {
    const condition = getString(body.condition).toLowerCase();
    if (!CONDITIONS.includes(condition)) {
      throw new AppError('Please choose a valid condition.', 400);
    }
    fields.condition = condition;
  }

  if (has('status')) {
    const status = getString(body.status).toLowerCase();
    if (!STATUSES.includes(status) || (!partial && status === 'hidden')) {
      throw new AppError('Please choose a valid listing status.', 400);
    }
    fields.status = status;
  }

  return fields;
}

function getSellerId(listing) {
  return listing.seller?._id || listing.seller;
}

function isOwner(listing, user) {
  return Boolean(user && String(getSellerId(listing)) === String(user._id));
}

async function findListingForOwner(id, user) {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new AppError('Listing not found.', 404);
  }

  if (!isOwner(listing, user)) {
    throw new AppError('You do not have permission to modify this listing.', 403);
  }

  return listing;
}

async function listListings(req, res) {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit);
  const filter = { status: { $ne: 'hidden' } };

  if (req.query.category) {
    const category = getString(req.query.category).toLowerCase();
    if (!CATEGORIES.includes(category)) {
      throw new AppError('Please choose a valid category.', 400);
    }
    filter.category = category;
  }

  if (req.query.condition) {
    const condition = getString(req.query.condition).toLowerCase();
    if (!CONDITIONS.includes(condition)) {
      throw new AppError('Please choose a valid condition.', 400);
    }
    filter.condition = condition;
  }

  if (req.query.size) {
    filter.size = getString(req.query.size);
  }

  if (req.query.status) {
    const status = getString(req.query.status).toLowerCase();
    if (!['available', 'sold'].includes(status)) {
      throw new AppError('Invalid public listing status.', 400);
    }
    filter.status = status;
  }

  const search = getString(req.query.search);
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: escapedSearch, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Listing.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

async function getListing(req, res) {
  const listing = await Listing.findById(req.params.id).populate('seller', 'name');

  if (!listing || (listing.status === 'hidden' && !isOwner(listing, req.user))) {
    throw new AppError('Listing not found.', 404);
  }

  res.json({ listing });
}

async function getMyListings(req, res) {
  const listings = await Listing.find({ seller: req.user._id })
    .populate('seller', 'name')
    .sort({ createdAt: -1 });

  res.json({ listings });
}

async function createListing(req, res) {
  const fields = parseListingFields(req.body);
  const files = req.files || [];

  if (files.length < 1 || files.length > 5) {
    throw new AppError('Please attach between 1 and 5 images.', 400);
  }

  const uploadedImages = [];

  let listing;

  try {
    for (const file of files) {
      uploadedImages.push(await uploadImage(file));
    }

    listing = await Listing.create({
      ...fields,
      seller: req.user._id,
      images: uploadedImages,
      status: 'available',
    });
  } catch (error) {
    await cleanupImages(uploadedImages);
    throw error;
  }

  await listing.populate('seller', 'name');
  res.status(201).json({ listing });
}

async function updateListing(req, res) {
  const listing = await findListingForOwner(req.params.id, req.user);
  const fields = parseListingFields(req.body, { partial: true });
  const files = req.files || [];
  const requestedRemovals = normalizeArray(req.body?.removeImagePublicIds);
  const existingImages = listing.images.map((image) => ({
    publicId: image.publicId,
    secureUrl: image.secureUrl,
  }));
  const existingIds = new Set(existingImages.map((image) => image.publicId));
  const removals = [...new Set(requestedRemovals)];

  if (removals.some((publicId) => !existingIds.has(publicId))) {
    throw new AppError('One or more images do not belong to this listing.', 400);
  }

  const removedIds = new Set(removals);
  const retainedImages = existingImages.filter((image) => !removedIds.has(image.publicId));

  if (retainedImages.length + files.length > 5) {
    throw new AppError('A listing can contain no more than five images.', 400);
  }

  if (retainedImages.length + files.length < 1) {
    throw new AppError('A listing must keep at least one image.', 400);
  }

  const uploadedImages = [];

  try {
    for (const file of files) {
      uploadedImages.push(await uploadImage(file));
    }

    Object.assign(listing, fields);
    listing.images = [...retainedImages, ...uploadedImages];
    await listing.save();
  } catch (error) {
    await cleanupImages(uploadedImages);
    throw error;
  }

  const removedImages = existingImages.filter((image) => removedIds.has(image.publicId));
  await Promise.all(removedImages.map((image) => destroyImage(image.publicId)));

  await listing.populate('seller', 'name');
  res.json({ listing });
}

async function hideListing(req, res) {
  const listing = await findListingForOwner(req.params.id, req.user);

  listing.status = 'hidden';
  await listing.save();
  await listing.populate('seller', 'name');

  res.json({
    message: 'Listing hidden.',
    listing,
  });
}

module.exports = {
  createListing,
  getListing,
  getMyListings,
  hideListing,
  listListings,
  parseListingFields,
  updateListing,
};
