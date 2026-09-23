import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/useAuth';
import { conditionLabel, formatDate, formatPrice, statusLabel } from '../utils/format';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';

function getSellerId(listing) {
  return listing.seller?._id || listing.seller;
}

export default function ListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionPending, setActionPending] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getListing(id)
      .then((data) => {
        if (active) {
          setListing(data.listing);
          setActiveImage(0);
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

  if (loading) {
    return <LoadingState label="Loading listing…" fullPage />;
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <ErrorMessage>{error || 'Listing not found.'}</ErrorMessage>
        <Link to="/" className="mt-6 inline-block font-bold text-emerald-800 underline underline-offset-4">Back to browse</Link>
      </div>
    );
  }

  const isOwner = user && String(user.id) === String(getSellerId(listing));
  const images = listing.images || [];
  const selectedImage = images[activeImage] || images[0];

  async function markSold() {
    setActionError('');
    setActionPending(true);

    try {
      const data = await api.updateListing(id, { status: 'sold' });
      setListing(data.listing);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setActionPending(false);
    }
  }

  async function hideListing() {
    if (!window.confirm('Hide this listing from public view?')) {
      return;
    }

    setActionError('');
    setActionPending(true);

    try {
      await api.hideListing(id);
      navigate('/my-listings', { replace: true });
    } catch (requestError) {
      setActionError(requestError.message);
      setActionPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 transition hover:text-emerald-800">← Back to browse</Link>

      {listing.status === 'hidden' ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">This listing is hidden. Only you can see it in My listings.</div>
      ) : null}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <div className="overflow-hidden rounded-[2rem] bg-stone-100 shadow-xl shadow-stone-200/60">
            {selectedImage ? <img src={selectedImage.secureUrl} alt={listing.title} className="aspect-[4/5] h-full w-full object-cover" /> : null}
          </div>
          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((image, index) => (
                <button key={image.publicId} type="button" onClick={() => setActiveImage(index)} className={`overflow-hidden rounded-2xl border-2 bg-stone-100 transition ${index === activeImage ? 'border-emerald-700' : 'border-transparent hover:border-stone-300'}`} aria-label={`View image ${index + 1}`}>
                  <img src={image.secureUrl} alt="" className="aspect-square h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={listing.status} />
            <span className="text-sm font-medium text-stone-500">Listed {formatDate(listing.createdAt)}</span>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-stone-950 sm:text-5xl">{listing.title}</h1>
          <p className="mt-4 text-3xl font-black text-emerald-800">{formatPrice(listing.priceCents)}</p>

          <dl className="mt-8 grid grid-cols-2 gap-3 border-y border-stone-200 py-6 sm:grid-cols-4">
            <div><dt className="text-xs font-bold uppercase tracking-wider text-stone-400">Size</dt><dd className="mt-1 font-bold text-stone-800">{listing.size}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-stone-400">Condition</dt><dd className="mt-1 font-bold text-stone-800">{conditionLabel(listing.condition)}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-stone-400">Category</dt><dd className="mt-1 font-bold capitalize text-stone-800">{listing.category}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-stone-400">Status</dt><dd className="mt-1 font-bold text-stone-800">{statusLabel(listing.status)}</dd></div>
          </dl>

          {listing.description ? <p className="mt-8 whitespace-pre-line text-base leading-8 text-stone-600">{listing.description}</p> : <p className="mt-8 text-stone-500">The seller did not add a description.</p>}

          <div className="mt-8 rounded-3xl bg-stone-100 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Listed by</p>
            <p className="mt-2 font-bold text-stone-900">{listing.seller?.name || 'Reworn member'}</p>
            <p className="mt-1 text-sm text-stone-500">Community member</p>
          </div>

          {isOwner ? (
            <div className="mt-8 border-t border-stone-200 pt-6">
              <p className="text-sm font-bold text-stone-900">Manage this listing</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={`/listings/${listing._id}/edit`} className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-700">Edit listing</Link>
                {listing.status === 'available' ? <button type="button" disabled={actionPending} onClick={markSold} className="rounded-2xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-white disabled:opacity-50">Mark as sold</button> : null}
                {listing.status !== 'hidden' ? <button type="button" disabled={actionPending} onClick={hideListing} className="rounded-2xl border border-red-200 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50">Hide listing</button> : null}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">Interested? Message the seller directly through the marketplace experience when community messaging is added.</div>
          )}
          <ErrorMessage className="mt-4">{actionError}</ErrorMessage>
        </div>
      </div>
    </div>
  );
}
