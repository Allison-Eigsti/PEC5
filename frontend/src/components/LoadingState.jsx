export default function LoadingState({ label = 'Loading…', fullPage = false }) {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'min-h-[60vh]' : 'py-16'}`}>
      <div className="flex items-center gap-3 text-sm font-medium text-stone-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-700" />
        {label}
      </div>
    </div>
  );
}
