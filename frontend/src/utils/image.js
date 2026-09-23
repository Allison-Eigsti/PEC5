import { MAX_IMAGE_BYTES } from './constants';

function loadImage(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file).then((bitmap) => ({
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    }));
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        close: () => {},
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('This image could not be read.'));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
}

export async function prepareImage(file) {
  if (file.size <= MAX_IMAGE_BYTES) {
    return file;
  }

  const image = await loadImage(file);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / image.width, maxDimension / image.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext('2d');
  if (!context) {
    image.close();
    throw new Error('Your browser could not prepare this image.');
  }

  context.drawImage(image.source, 0, 0, canvas.width, canvas.height);
  image.close();

  let quality = 0.84;
  let blob = await canvasToBlob(canvas, quality);

  while (blob && blob.size > MAX_IMAGE_BYTES && quality > 0.45) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  if (!blob || blob.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name} is too large even after compression.`);
  }

  const fileName = file.name.replace(/\.[^/.]+$/, '') || 'clothing';
  return new File([blob], `${fileName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export async function prepareImages(files) {
  return Promise.all(Array.from(files).map((file) => prepareImage(file)));
}
