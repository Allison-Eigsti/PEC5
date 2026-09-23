const mongoose = require('mongoose');

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
const CONDITIONS = ['new', 'excellent', 'good', 'fair'];
const STATUSES = ['available', 'sold', 'hidden'];

const imageSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 3000,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Price must be a whole number of cents.',
      },
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    size: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    condition: {
      type: String,
      required: true,
      enum: CONDITIONS,
    },
    images: {
      type: [imageSchema],
      required: true,
      validate: {
        validator: (images) => Array.isArray(images) && images.length >= 1 && images.length <= 5,
        message: 'A listing must contain between 1 and 5 images.',
      },
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'available',
      index: true,
    },
  },
  { timestamps: true },
);

listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ seller: 1, createdAt: -1 });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
module.exports.CATEGORIES = CATEGORIES;
module.exports.CONDITIONS = CONDITIONS;
module.exports.STATUSES = STATUSES;
