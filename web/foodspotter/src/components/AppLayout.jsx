import AppSidebar from "./AppSidebar";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function AppLayout({
  title,
  subtitle,
  children,
  fullScreen = false,
}) {
  const { user } = useAuth();
  const currentUser = user || {};

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#fffdf9_30%,#f8fafc_68%,#eef2ff_100%)] md:flex md:overflow-hidden">
      <AppSidebar />

      <div className="flex flex-1 min-h-0 flex-col md:max-h-screen">
        <header className="sticky top-0 z-20 shrink-0 border-b border-orange-100/80 bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
            src="/image.png"
            alt="FoodSpotter"
            className="h-12 w-18 shrink-0 shadow-md shadow-orange-500/15 ring-1 ring-white/60"
          />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight header-title sm:text-base">
                  FoodSpotter
                </p>
                <p className="truncate text-xs text-gray-500 sm:text-sm">
                  Find and share local food spots
                </p>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-orange-100 bg-orange-50/80 px-4 py-2 text-right shadow-sm sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {currentUser.firstname || "User"} {currentUser.lastname || ""}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-orange-700">
                {currentUser.role || "USER"}
              </p>
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
