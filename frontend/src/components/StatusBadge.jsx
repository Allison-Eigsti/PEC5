import { statusLabel } from '../utils/format';

const styles = {
  available: 'bg-emerald-100 text-emerald-800',
  sold: 'bg-stone-200 text-stone-700',
  hidden: 'bg-amber-100 text-amber-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] ${styles[status] || styles.available}`}>
      {statusLabel(status)}
    </span>
  );
}
