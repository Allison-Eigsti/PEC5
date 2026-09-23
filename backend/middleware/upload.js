const multer = require('multer');
const AppError = require('../utils/AppError');

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageBytes = Number(process.env.MAX_IMAGE_BYTES) || 786432;
const maxRequestBytes = Number(process.env.MAX_REQUEST_BYTES) || 4000000;

function enforceRequestSize(req, res, next) {
  const contentLength = Number(req.get('content-length'));

  if (Number.isFinite(contentLength) && contentLength > maxRequestBytes) {
    return next(
      new AppError(
        'The image upload is too large. Keep the total request under 4 MB.',
        413,
      ),
    );
  }

  return next();
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: maxImageBytes,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new AppError('Only JPEG, PNG, and WebP images are allowed.', 400));
    }

    return callback(null, true);
  },
});

const uploadImages = upload.array('images', 5);

module.exports = {
  enforceRequestSize,
  maxImageBytes,
  maxRequestBytes,
  uploadImages,
};
