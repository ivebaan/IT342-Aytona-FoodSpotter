import AppSidebar from "./AppSidebar";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AppLayout({
  title,
  subtitle,
  children,
  fullScreen = false,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUser = user || {};
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/explore?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fffdf9_30%,#f8fafc_68%,#eef2ff_100%)] md:flex md:overflow-hidden">
      <AppSidebar />

      <div className="flex flex-1 min-h-0 flex-col md:max-h-screen">
        <header className="sticky top-0 z-20 shrink-0 border-b border-orange-100/70 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/image.png"
                alt="FoodSpotter"
                className="h-11 w-16 shrink-0 rounded-lg shadow-md shadow-orange-500/15 ring-1 ring-white/60"
              />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-bold tracking-tight text-slate-900">
                  FoodSpotter
                </p>
                <p className="truncate text-xs text-slate-500">
                  Find and share local food spots
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 items-center justify-center"
            >
              <label className="sr-only" htmlFor="global-foodspotter-search">
                Search food spots
              </label>
              <div className="flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 shadow-sm transition focus-within:border-orange-200 focus-within:bg-white focus-within:shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="global-foodspotter-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for food stalls, cuisines, or locations..."
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </form>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-orange-200 hover:text-orange-600 sm:inline-flex"
                aria-label="Notifications"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4.5 w-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 17h5l-1.405-1.405A2 2 0 0 1 18 14.172V11a6 6 0 1 0-12 0v3.172a2 2 0 0 1-.595 1.423L4 17h5" />
                  <path d="M9 17a3 3 0 0 0 6 0" />
                </svg>
              </button>

              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-sm">
                  {(currentUser.firstname?.[0] || "F")
                    .concat(currentUser.lastname?.[0] || "S")
                    .toUpperCase()}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {currentUser.firstname || "User"} {currentUser.lastname || ""}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {currentUser.role || "USER"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main
          className={
            fullScreen
              ? "flex-1 min-h-0 overflow-hidden"
              : "flex-1 min-h-0 overflow-y-auto max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 w-full"
          }
        >
          {!fullScreen && (
            <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                FoodSpotter workspace
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
