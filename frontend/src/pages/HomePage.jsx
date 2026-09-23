import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS, SIZE_OPTIONS } from '../utils/constants';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import ListingCard from '../components/ListingCard';
import LoadingState from '../components/LoadingState';

const emptyFilters = {
  search: '',
  category: '',
  size: '',
  condition: '',
  status: '',
  page: 1,
};

export default function HomePage() {
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const items = Array.isArray(data.items) ? data.items : [];

  useEffect(() => {
    let active = true;
    api
      .getListings(filters)
      .then((response) => {
        if (active) {
          setData(response);
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
  }, [filters]);

  function updateDraft(event) {
    const { name, value } = event.target;
    setDraftFilters((current) => ({ ...current, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setFilters({ ...draftFilters, page: 1 });
  }

  function clearFilters() {
    setLoading(true);
    setError('');
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  }

  function changePage(page) {
    setLoading(true);
    setError('');
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <section className="overflow-hidden border-b border-stone-200 bg-emerald-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300">The community closet</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.06em] sm:text-6xl">Good clothes deserve a second story.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/80">Find thoughtful pieces from people nearby, or pass on something you no longer wear.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#browse" className="rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-emerald-950 shadow-sm transition hover:bg-amber-200">Browse the edit</a>
              <Link to="/register" className="rounded-2xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Join the community</Link>
            </div>
          </div>
          <div className="relative hidden min-h-72 lg:block" aria-hidden="true">
            <div className="absolute right-4 top-4 h-64 w-52 rotate-6 rounded-[2rem] border-8 border-white/10 bg-amber-300 shadow-2xl" />
            <div className="absolute left-16 top-12 h-64 w-52 -rotate-6 rounded-[2rem] border-8 border-white/10 bg-emerald-700 shadow-2xl" />
            <div className="absolute left-32 top-24 flex h-36 w-36 items-center justify-center rounded-full bg-stone-50 text-6xl text-emerald-900 shadow-xl">♻</div>
          </div>
        </div>
      </section>

      <section id="browse" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">Find your next favorite</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-stone-950">The latest listings</h2>
          </div>
          {data.total > 0 ? <p className="text-sm font-medium text-stone-500">{data.total} item{data.total === 1 ? '' : 's'} found</p> : null}
        </div>

        <form onSubmit={applyFilters} className="mt-8 grid gap-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:p-5">
          <label className="sr-only" htmlFor="search">Search listings</label>
          <input id="search" name="search" value={draftFilters.search} onChange={updateDraft} className="rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100" placeholder="Search titles…" />
          <label className="sr-only" htmlFor="category">Category</label>
          <select id="category" name="category" value={draftFilters.category} onChange={updateDraft} className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100">
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
          </select>
          <label className="sr-only" htmlFor="size">Size</label>
          <select id="size" name="size" value={draftFilters.size} onChange={updateDraft} className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100">
            <option value="">All sizes</option>
            {SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <label className="sr-only" htmlFor="condition">Condition</label>
          <select id="condition" name="condition" value={draftFilters.condition} onChange={updateDraft} className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100">
            <option value="">Any condition</option>
            {CONDITION_OPTIONS.map((condition) => <option key={condition.value} value={condition.value}>{condition.label}</option>)}
          </select>
          <button type="submit" className="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-700">Search</button>
        </form>

        {(filters.search || filters.category || filters.size || filters.condition || filters.status) ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-500">
            <span>Showing filtered results</span>
            <button type="button" onClick={clearFilters} className="font-bold text-emerald-800 underline underline-offset-4">Clear filters</button>
          </div>
        ) : null}

        <div className="mt-8">
          {loading ? <LoadingState label="Finding good pieces…" /> : null}
          {!loading && error ? <ErrorMessage>{error}</ErrorMessage> : null}
          {!loading && !error && items.length === 0 ? (
            <EmptyState
              title="No pieces match those filters"
              description="Try broadening your search, or be the first to share something great with the community."
              action={<button type="button" onClick={clearFilters} className="rounded-2xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white">Clear filters</button>}
            />
          ) : null}
          {!loading && !error && items.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
            </div>
          ) : null}
        </div>

        {!loading && data.pages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button type="button" disabled={data.page <= 1} onClick={() => changePage(data.page - 1)} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <span className="px-3 text-sm font-semibold text-stone-500">Page {data.page} of {data.pages}</span>
            <button type="button" disabled={data.page >= data.pages} onClick={() => changePage(data.page + 1)} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        ) : null}
      </section>
    </>
  );
}
