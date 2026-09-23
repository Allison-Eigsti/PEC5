const cloudinary = require('cloudinary');
const AppError = require('../utils/AppError');

let configured = false;

function configureCloudinary() {
  if (configured) {
    return;
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary is not configured on the server.', 500);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  configured = true;
}

function uploadImage(file) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'secondhand-listings',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error || !result) {
          reject(new AppError('Cloudinary could not store the image.', 502));
          return;
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
        });
      },
    );

    stream.end(file.buffer);
  });
}

async function destroyImage(publicId) {
  try {
    configureCloudinary();
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (error) {
    // A database update should not fail just because a best-effort cleanup failed.
    console.error(`Could not remove Cloudinary asset ${publicId}:`, error.message);
  }
}

async function cleanupImages(images) {
  await Promise.all(images.map((image) => destroyImage(image.publicId)));
}

module.exports = { cleanupImages, destroyImage, uploadImage };
