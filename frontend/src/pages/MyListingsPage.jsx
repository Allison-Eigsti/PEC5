import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import ListingCard from '../components/ListingCard';
import LoadingState from '../components/LoadingState';
import StatusBadge from '../components/StatusBadge';

const listingActionClass = 'inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-bold leading-none transition';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingId, setPendingId] = useState('');

  useEffect(() => {
    let active = true;

    api
      .getMyListings()
      .then((data) => {
        if (active) {
          setListings(data.listings);
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
  }, []);

  async function hideListing(id) {
    if (!window.confirm('Hide this listing from public view?')) {
      return;
    }

    setPendingId(id);
    setActionError('');

    try {
      await api.hideListing(id);
      setListings((current) => current.map((listing) => (
        listing._id === id ? { ...listing, status: 'hidden' } : listing
      )));
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setPendingId('');
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">Your corner of the closet</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-stone-950">My listings</h1>
          <p className="mt-3 text-base text-stone-600">Keep your pieces up to date, mark them sold, or hide them when they are no longer available.</p>
        </div>
        <Link to="/sell" className="inline-flex items-center justify-center rounded-2xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900">+ List an item</Link>
      </div>

      <div className="mt-10">
        {loading ? <LoadingState label="Loading your listings…" /> : null}
        {!loading && error ? <ErrorMessage>{error}</ErrorMessage> : null}
        {!loading && !error && listings.length === 0 ? (
          <EmptyState
            title="Your closet is ready for its first listing"
            description="Share something you no longer wear and help it find a new home."
            action={<Link to="/sell" className="rounded-2xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white">List your first item</Link>}
          />
        ) : null}
        {!loading && !error && listings.length > 0 ? (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-stone-500">
              <span>{listings.length} listing{listings.length === 1 ? '' : 's'}</span>
              <span>·</span>
              <span>{listings.filter((listing) => listing.status === 'available').length} available</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing}>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={listing.status} />
                    <Link to={`/listings/${listing._id}/edit`} className={`${listingActionClass} ml-auto border-emerald-300 text-emerald-800 hover:bg-emerald-50`}>Edit</Link>
                    {listing.status !== 'hidden' ? (
                      <button type="button" disabled={pendingId === listing._id} onClick={() => hideListing(listing._id)} className={`${listingActionClass} border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50`}>Hide</button>
                    ) : null}
                  </div>
                </ListingCard>
              ))}
            </div>
            <ErrorMessage className="mt-5">{actionError}</ErrorMessage>
          </>
        ) : null}
      </div>
    </div>
  );
}
