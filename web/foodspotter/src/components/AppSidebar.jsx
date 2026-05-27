import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

const navItemBaseClass =
  "group inline-flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ease-out";

const navItems = [
  { to: "/dashboard", label: "Home", icon: "home" },
  { to: "/explore", label: "Explore", icon: "explore" },
  { to: "/favorites", label: "Favorites", icon: "favorites" },
  { to: "/profile", label: "Profile", icon: "profile" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

function SidebarIcon({ name }) {
  if (name === "home") {
    return (
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
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4.5v-6h3v6H18a1 1 0 0 0 1-1V9.5" />
      </svg>
    );
  }

  if (name === "explore") {
    return (
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
        <circle cx="12" cy="12" r="8" />
        <path d="M10 14l4-4" />
        <path d="m10 10 4 4" />
      </svg>
    );
  }

  if (name === "favorites") {
    return (
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
        <path d="m12 20-1.1-1c-4-3.6-6.4-5.8-6.4-8.6A4.4 4.4 0 0 1 9 6a4.7 4.7 0 0 1 3 1.1A4.7 4.7 0 0 1 15 6a4.4 4.4 0 0 1 4.5 4.4c0 2.8-2.4 5-6.4 8.6z" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
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
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  return (
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1 1a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.4a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1-1a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-1.4a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1-1a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .5-.9V4a1 1 0 0 1 1-1h1.4a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1 1a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.5H20a1 1 0 0 1 1 1v1.4a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6z" />
    </svg>
  );
}

export default function AppSidebar() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const user = currentUser || {};
  const isAdmin = user.role === "ADMIN";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = [user.firstname, user.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();
  const initials = `${user.firstname?.[0] || "F"}${user.lastname?.[0] || "S"}`;

  return (
    <aside className="app-sidebar relative flex w-full flex-col overflow-hidden border-r border-slate-200/70 bg-white shadow-[18px_0_50px_rgba(15,23,42,0.05)] md:min-h-screen md:w-72">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.18),transparent_45%)]" />

      <div className="relative border-b border-slate-100 px-5 py-5">
        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
          <img
            src="/image.png"
            alt="FoodSpotter"
            className="h-11 w-16 shrink-0 rounded-lg shadow-md shadow-orange-500/15 ring-1 ring-white/60"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold tracking-tight text-slate-950">
              FoodSpotter
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Discover & manage the best food spots
            </p>
          </div>
        </div>
      </div>

      <nav className="relative flex flex-row gap-2 overflow-x-auto px-4 py-4 md:flex-col md:overflow-visible md:px-5 md:py-5">
        <div className="hidden px-1 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 md:block">
          Main Navigation
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `${navItemBaseClass} border transition-all duration-300 ${
                isActive
                  ? "border-orange-200 bg-orange-50 text-orange-700 shadow-sm"
                  : "border-transparent bg-white text-slate-600 hover:border-orange-100 hover:bg-orange-50/70 hover:text-slate-900"
              }`
            }
          >
            <span
              className={`inline-flex items-center justify-center rounded-lg p-2.5 transition-all duration-300 ${item.to === "/dashboard" ? "bg-orange-100 text-orange-600" : "bg-orange-50 text-orange-500"}`}
            >
              <SidebarIcon name={item.icon} />
            </span>
            <span className="flex-1 text-left font-medium">{item.label}</span>
          </NavLink>
        ))}

        {(user.role === "VENDOR" || user.role === "OWNER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
          <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm transition-all duration-300 md:mt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Vendor Tools
            </p>
            <NavLink
              to="/vendor/stalls"
              className={({ isActive }) =>
                `${navItemBaseClass} mt-4 border transition-all duration-300 ${
                  isActive
                    ? "border-emerald-300 bg-emerald-100 text-emerald-900 shadow-sm"
                    : "border-emerald-100 bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
                }`
              }
            >
              <span className="inline-flex items-center justify-center rounded-lg p-2.5 transition-all duration-300 bg-emerald-100 text-emerald-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span className="flex-1 text-left font-medium">My Stalls</span>
            </NavLink>
          </div>
        )}

        {isAdmin && (
          <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 shadow-sm transition-all duration-300 md:mt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700">
              Admin Controls
            </p>
            <NavLink
              to="/admin/panel"
              className={({ isActive }) =>
                `${navItemBaseClass} mt-4 border transition-all duration-300 ${
                  isActive
                    ? "border-indigo-300 bg-indigo-100 text-indigo-900 shadow-sm"
                    : "border-indigo-100 bg-white text-indigo-800 hover:bg-indigo-50 hover:text-indigo-950"
                }`
              }
            >
              <span className="inline-flex items-center justify-center rounded-lg p-2.5 transition-all duration-300 bg-indigo-100 text-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 2 4 6v6c0 5 3.5 9.7 8 10 4.5-.3 8-5 8-10V6l-8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <span className="flex-1 text-left font-medium">Admin Panel</span>
            </NavLink>
          </div>
        )}
      </nav>

      <div className="relative mt-auto border-t border-slate-100 p-5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 shadow-sm transition-all duration-300">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Session
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-md shadow-orange-500/20 ring-2 ring-white/30">
              {initials.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {displayName || "Your account"}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user.email || "Signed in"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
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
            <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
