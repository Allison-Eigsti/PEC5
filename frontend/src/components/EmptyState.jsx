export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl" aria-hidden="true">
        ♻
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-stone-900">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
