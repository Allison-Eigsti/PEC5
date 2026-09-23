const cloudinary = require('cloudinary').v2;
const AppError = require('../utils/AppError');

let configured = false;
const uploadTimeoutMs = Number(process.env.CLOUDINARY_TIMEOUT_MS) || 20000;
const CLOUDINARY_FOLDER = 'secondhand-listings';

function configureCloudinary() {
  if (configured) {
    return;
  }

  if (!process.env.CLOUDINARY_URL) {
    throw new AppError('CLOUDINARY_URL is not configured on the server.', 500);
  }

  // The Cloudinary v2 SDK reads cloud_name, api_key, and api_secret from CLOUDINARY_URL.
  cloudinary.config({ secure: true });

  configured = true;
}

function uploadImage(file) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    let settled = false;
    let stream;
    let timeoutId;

    const settle = (callback, value) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      callback(value);
    };

    console.log('Starting Cloudinary image upload.');
    stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error || !result) {
          settle(reject, new AppError('Cloudinary could not store the image.', 502, true));
          return;
        }

        console.log('Cloudinary image upload completed.');
        settle(resolve, {
          publicId: result.public_id,
          secureUrl: result.secure_url,
        });
      },
    );

    stream.on('error', () => {
      settle(reject, new AppError('Cloudinary could not store the image.', 502));
    });

    timeoutId = setTimeout(() => {
      if (stream && !stream.destroyed) {
        stream.destroy();
      }

      settle(reject, new AppError('Cloudinary image upload timed out. Please try again.', 504, true));
    }, uploadTimeoutMs);

    stream.end(file.buffer);
  });
}

async function destroyImage(publicId) {
  let timeoutId;

  try {
    configureCloudinary();
    await Promise.race([
      cloudinary.uploader.destroy(publicId, { invalidate: true }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Cloudinary cleanup timed out.')), 5000);
      }),
    ]);
  } catch (error) {
    // A database update should not fail just because a best-effort cleanup failed.
    console.error(`Could not remove Cloudinary asset ${publicId}:`, error.message);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function cleanupImages(images) {
  await Promise.allSettled(images.map((image) => destroyImage(image.publicId)));
}

module.exports = { cleanupImages, destroyImage, uploadImage };
