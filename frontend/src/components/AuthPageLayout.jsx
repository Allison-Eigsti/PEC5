import { Link } from 'react-router-dom';

export default function AuthPageLayout({ eyebrow, title, description, children, footer }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
      <div className="max-w-xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-stone-950 sm:text-5xl">{title}</h1>
        <p className="mt-5 text-base leading-7 text-stone-600">{description}</p>
        {footer ? <div className="mt-7 text-sm text-stone-600">{footer}</div> : null}
      </div>
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50 sm:p-10">
        {children}
      </div>
    </div>
  );
}

export function AuthLink({ to, children }) {
  return <Link to={to} className="font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950">{children}</Link>;
}
