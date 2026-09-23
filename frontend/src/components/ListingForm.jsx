import { useEffect, useState } from 'react';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS, MAX_IMAGES, MAX_IMAGE_BYTES, SIZE_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { prepareImages } from '../utils/image';
import ErrorMessage from './ErrorMessage';
import FormField, { inputClass } from './FormField';

function FilePreview({ file, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
      {previewUrl ? <img src={previewUrl} alt="Selected clothing preview" className="h-full w-full object-cover" /> : <div className="h-full w-full animate-pulse bg-stone-200" />}
      <button
        type="button"
        onClick={() => onRemove(file)}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-stone-700 shadow-sm transition hover:bg-red-600 hover:text-white"
        aria-label={`Remove ${file.name}`}
      >
        ×
      </button>
      <span className="absolute bottom-2 left-2 rounded-full bg-stone-900/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">New</span>
    </div>
  );
}

function ExistingImagePreview({ image, onRemove }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
      <img src={image.secureUrl} alt="Current clothing listing" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={() => onRemove(image.publicId)}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-stone-700 shadow-sm transition hover:bg-red-600 hover:text-white"
        aria-label="Remove current image"
      >
        ×
      </button>
      <span className="absolute bottom-2 left-2 rounded-full bg-emerald-800/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Current</span>
    </div>
  );
}

function initialValues(listing) {
  return {
    title: listing?.title || '',
    description: listing?.description || '',
    price: listing ? (Number(listing.priceCents) / 100).toFixed(2) : '',
    category: listing?.category || 'tops',
    size: listing?.size || 'M',
    condition: listing?.condition || 'good',
    status: listing?.status || 'available',
  };
}

export default function ListingForm({ initialListing, onSubmit, submitLabel = 'Publish listing', isSubmitting = false, serverError = '' }) {
  const [values, setValues] = useState(() => initialValues(initialListing));
  const [files, setFiles] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [localError, setLocalError] = useState('');
  const [preparingImages, setPreparingImages] = useState(false);

  const existingImages = initialListing?.images || [];
  const visibleExistingImages = existingImages.filter((image) => !removedImageIds.includes(image.publicId));
  const totalImages = visibleExistingImages.length + files.length;
  const remainingSlots = Math.max(0, MAX_IMAGES - totalImages);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';

    if (!selectedFiles.length) {
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      setLocalError(`You can add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}.`);
      return;
    }

    setPreparingImages(true);
    setLocalError('');

    try {
      const preparedFiles = await prepareImages(selectedFiles);
      setFiles((current) => [...current, ...preparedFiles]);
    } catch (error) {
      setLocalError(error.message);
    } finally {
      setPreparingImages(false);
    }
  }

  function removeNewFile(file) {
    setFiles((current) => current.filter((currentFile) => currentFile !== file));
  }

  function toggleExistingImage(publicId) {
    setRemovedImageIds((current) => (
      current.includes(publicId)
        ? current.filter((id) => id !== publicId)
        : [...current, publicId]
    ));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError('');

    if (!values.title.trim()) {
      setLocalError('Give your listing a title.');
      return;
    }

    const price = Number(values.price);
    if (!Number.isFinite(price) || price < 0) {
      setLocalError('Enter a valid price.');
      return;
    }

    if (totalImages < 1) {
      setLocalError('Add at least one image.');
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title.trim());
    formData.append('description', values.description.trim());
    formData.append('priceCents', String(Math.round(price * 100)));
    formData.append('category', values.category);
    formData.append('size', values.size);
    formData.append('condition', values.condition);
    formData.append('status', values.status);
    files.forEach((file) => formData.append('images', file));
    removedImageIds.forEach((publicId) => formData.append('removeImagePublicIds', publicId));

    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Listing title" id="title">
            <input id="title" name="title" value={values.title} onChange={updateValue} className={inputClass} placeholder="e.g. Vintage denim jacket" maxLength={120} required />
          </FormField>
        </div>
        <FormField label="Price (USD)" id="price">
          <input id="price" name="price" type="number" min="0" step="0.01" value={values.price} onChange={updateValue} className={inputClass} placeholder="0.00" required />
        </FormField>
        <FormField label="Size" id="size" hint="Use a size or a simple note such as 'One size'.">
          <input id="size" name="size" list="size-options" value={values.size} onChange={updateValue} className={inputClass} placeholder="M" maxLength={30} required />
          <datalist id="size-options">
            {SIZE_OPTIONS.map((size) => <option key={size} value={size} />)}
          </datalist>
        </FormField>
        <FormField label="Category" id="category">
          <select id="category" name="category" value={values.category} onChange={updateValue} className={inputClass} required>
            {CATEGORY_OPTIONS.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
          </select>
        </FormField>
        <FormField label="Condition" id="condition">
          <select id="condition" name="condition" value={values.condition} onChange={updateValue} className={inputClass} required>
            {CONDITION_OPTIONS.map((condition) => <option key={condition.value} value={condition.value}>{condition.label}</option>)}
          </select>
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Description" id="description" hint="Share the fit, fabric, and any signs of wear.">
            <textarea id="description" name="description" value={values.description} onChange={updateValue} className={`${inputClass} min-h-32 resize-y`} placeholder="Tell the next owner what makes this piece special…" maxLength={3000} />
          </FormField>
        </div>
        {initialListing ? (
          <FormField label="Listing status" id="status" hint="Hidden listings are visible only in My listings.">
            <select id="status" name="status" value={values.status} onChange={updateValue} className={inputClass}>
              {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>
        ) : null}
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-stone-900">Photos</h2>
            <p className="mt-1 text-sm text-stone-500">Add 1–{MAX_IMAGES} clear photos. Large images are compressed in your browser.</p>
          </div>
          <span className="text-sm font-semibold text-stone-500">{totalImages}/{MAX_IMAGES}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {visibleExistingImages.map((image) => (
            <ExistingImagePreview key={image.publicId} image={image} onRemove={toggleExistingImage} />
          ))}
          {files.map((file) => <FilePreview key={`${file.name}-${file.lastModified}`} file={file} onRemove={removeNewFile} />)}
          {remainingSlots > 0 ? (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-center transition hover:border-emerald-600 hover:bg-emerald-50">
              <span className="text-2xl text-emerald-700">＋</span>
              <span className="mt-1 px-2 text-xs font-bold text-stone-600">Add photos</span>
              <span className="mt-1 px-2 text-[10px] text-stone-400">JPEG, PNG, WebP</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handleFileChange} disabled={preparingImages} />
            </label>
          ) : null}
        </div>
        {preparingImages ? <p className="mt-3 text-sm font-medium text-emerald-800">Preparing your photos…</p> : null}
        <p className="mt-3 text-xs leading-5 text-stone-500">Each image is kept under {Math.round(MAX_IMAGE_BYTES / 1024)} KB before upload to stay within Vercel&apos;s request limit.</p>
      </div>

      <ErrorMessage>{localError || serverError}</ErrorMessage>

      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => window.history.back()} className="rounded-2xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50">Cancel</button>
        <button type="submit" disabled={isSubmitting || preparingImages} className="rounded-2xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
