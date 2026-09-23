import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function navClass({ isActive }) {
  return `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5" aria-label="Reworn home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-lg text-white shadow-sm">↻</span>
            <span className="text-xl font-black tracking-[-0.04em] text-stone-900">reworn<span className="text-amber-600">.</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            <NavLink to="/" end className={navClass}>Browse</NavLink>
            {user ? <NavLink to="/sell" className={navClass}>Sell an item</NavLink> : null}
            {user ? <NavLink to="/my-listings" className={navClass}>My listings</NavLink> : null}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="max-w-32 truncate text-sm font-semibold text-stone-600">Hi, {user.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-400 hover:bg-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-bold text-stone-700 hover:text-stone-950">Log in</Link>
                <Link to="/register" className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900">Join Reworn</Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300 text-xl md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '×' : '☰'}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-stone-200 bg-white px-4 py-4 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
              <NavLink to="/" end onClick={closeMenu} className={navClass}>Browse</NavLink>
              {user ? <NavLink to="/sell" onClick={closeMenu} className={navClass}>Sell an item</NavLink> : null}
              {user ? <NavLink to="/my-listings" onClick={closeMenu} className={navClass}>My listings</NavLink> : null}
              {user ? (
                <button type="button" onClick={handleLogout} className="mt-2 rounded-2xl border border-stone-300 px-4 py-3 text-left text-sm font-bold text-stone-700">Log out</button>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={closeMenu} className="rounded-2xl border border-stone-300 px-4 py-3 text-center text-sm font-bold text-stone-700">Log in</Link>
                  <Link to="/register" onClick={closeMenu} className="rounded-2xl bg-emerald-800 px-4 py-3 text-center text-sm font-bold text-white">Join Reworn</Link>
                </div>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-stone-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p><span className="font-black tracking-[-0.03em] text-stone-800">reworn.</span> Good clothes deserve another story.</p>
          <p>Built for a smaller, more circular closet.</p>
        </div>
      </footer>
    </div>
  );
}
