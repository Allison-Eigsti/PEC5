import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import ErrorMessage from '../components/ErrorMessage';
import ListingForm from '../components/ListingForm';
import LoadingState from '../components/LoadingState';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getListing(id)
      .then((data) => {
        if (active) {
          setListing(data.listing);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(formData) {
    setError('');
    setSubmitting(true);

    try {
      const data = await api.updateListing(id, formData);
      setListing(data.listing);
      navigate(`/listings/${id}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading your listing…" fullPage />;
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <ErrorMessage>{error || 'Listing not found.'}</ErrorMessage>
        <Link to="/my-listings" className="mt-6 inline-block font-bold text-emerald-800 underline underline-offset-4">Back to my listings</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <Link to={`/listings/${id}`} className="text-sm font-bold text-stone-500 hover:text-emerald-800">← Back to listing</Link>
      <div className="mt-6 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">Your listing</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-stone-950">Make an update.</h1>
        <p className="mt-4 text-base leading-7 text-stone-600">Adjust the details or replace photos. Hidden listings stay private to you.</p>
      </div>
      <div className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-xl shadow-stone-200/50 sm:p-8">
        <ListingForm initialListing={listing} onSubmit={handleSubmit} submitLabel="Save changes" isSubmitting={submitting} serverError={error} />
      </div>
    </div>
  );
}
