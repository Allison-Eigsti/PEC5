import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-7xl font-black tracking-[-0.08em] text-emerald-800">404</p>
      <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-stone-950">This page wandered off.</h1>
      <p className="mt-3 max-w-md text-stone-600">The link may be old, or the page may no longer be available.</p>
      <Link to="/" className="mt-7 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-white">Back to browse</Link>
    </div>
  );
}
