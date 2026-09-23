export const inputClass =
  'mt-2 block w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100';

export default function FormField({ label, id, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-stone-800">
        {label}
      </label>
      {hint ? <p className="mt-1 text-xs leading-5 text-stone-500">{hint}</p> : null}
      <div className={hint ? 'mt-1' : ''}>{children}</div>
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
