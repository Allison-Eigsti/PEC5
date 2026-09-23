import { Link } from 'react-router-dom';
import { conditionLabel, formatPrice } from '../utils/format';
import StatusBadge from './StatusBadge';

export default function ListingCard({ listing, children }) {
  const image = listing.images?.[0]?.secureUrl;

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/listings/${listing._id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          {image ? (
            <img
              src={image}
              alt={listing.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-stone-300" aria-hidden="true">
              ♻
            </div>
          )}
          {listing.status !== 'available' ? (
            <div className="absolute left-3 top-3">
              <StatusBadge status={listing.status} />
            </div>
          ) : null}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/listings/${listing._id}`} className="min-w-0">
            <h2 className="truncate text-base font-bold tracking-tight text-stone-900 group-hover:text-emerald-800">
              {listing.title}
            </h2>
          </Link>
          <p className="shrink-0 text-base font-bold text-emerald-800">{formatPrice(listing.priceCents)}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
          <span className="rounded-full bg-stone-100 px-2.5 py-1">{conditionLabel(listing.condition)}</span>
          <span>Size {listing.size}</span>
          {listing.seller?.name ? <span>· {listing.seller.name}</span> : null}
        </div>
        {children ? <div className="mt-4 border-t border-stone-100 pt-4">{children}</div> : null}
      </div>
    </article>
  );
}
