import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import ListingForm from '../components/ListingForm';

export default function SellPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData) {
    setError('');
    setSubmitting(true);

    try {
      const data = await api.createListing(formData);
      navigate(`/listings/${data.listing._id}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">Pass it on</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-stone-950 sm:text-5xl">List something good.</h1>
        <p className="mt-4 text-base leading-7 text-stone-600">Clear photos and an honest description help the right person find it.</p>
      </div>
      <div className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-xl shadow-stone-200/50 sm:p-8">
        <ListingForm onSubmit={handleSubmit} submitLabel="Publish listing" isSubmitting={submitting} serverError={error} />
      </div>
    </div>
  );
}
