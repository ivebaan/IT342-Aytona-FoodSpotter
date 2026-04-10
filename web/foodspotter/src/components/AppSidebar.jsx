import { NavLink, useNavigate } from "react-router-dom";

const navItemBaseClass =
  "group inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200";

const navItems = [
  { to: "/dashboard", label: "Home", icon: "home" },
  { to: "/profile", label: "Explore", icon: "explore" },
  { to: "/profile", label: "Favorites", icon: "favorites" },
  { to: "/profile", label: "Profile", icon: "profile" },
  { to: "/profile", label: "Settings", icon: "settings" },
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-full md:w-72 md:min-h-screen border-r border-orange-100 bg-white backdrop-blur-sm flex flex-col">
      <div className="px-6 py-6 border-b border-orange-100">
        <div className="inline-flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-500 text-white shadow-sm flex items-center justify-center">
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
              <path d="M3 10h18" />
              <path d="M5 10v3a7 7 0 0 0 14 0v-3" />
              <path d="M9 14v2" />
              <path d="M12 14v3" />
              <path d="M15 14v2" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-black">FoodSpotter</p>
            {/* <p className="text-xs text-orange-500">Navigation</p> */}
          </div>
        </div>
      </div>

      <nav className="p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {navItems.map((item) =>
          item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `${navItemBaseClass} ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-orange-700 hover:bg-orange-100/60 hover:text-orange-800"
                }`
              }
            >
              <span className="inline-flex items-center justify-center text-current">
                <SidebarIcon name={item.icon} />
              </span>
              {item.label}
            </NavLink>
          ) : (
            <div
              key={item.label}
              className={`${navItemBaseClass} text-orange-500/70 bg-orange-50/60 cursor-default`}
              title="Coming soon"
            >
              <span className="inline-flex items-center justify-center text-current">
                <SidebarIcon name={item.icon} />
              </span>
              {item.label}
            </div>
          ),
        )}
      </nav>

      <div className="p-4 mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
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
          Sign out
        </button>
      </div>
    </aside>
  );
}
