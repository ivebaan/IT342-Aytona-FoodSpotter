import { useMemo } from "react";
import AppSidebar from "./AppSidebar";

export default function AppLayout({ title, subtitle, children, fullScreen = false }) {
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    [],
  );

  return (
    <div className="h-screen bg-gray-50 md:flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col md:max-h-screen">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">
                🍜
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">FoodSpotter</p>
                <p className="text-xs text-gray-500">Find and share local food spots</p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-700">
                {user.firstname || "User"} {user.lastname || ""}
              </p>
              <p className="text-xs text-gray-500">{user.role || "USER"}</p>
            </div>
          </div>
        </header>

        <main className={fullScreen ? "flex-1 overflow-hidden" : "flex-1 overflow-auto max-w-6xl mx-auto px-6 py-8 space-y-8 w-full"}>
          {!fullScreen && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
              {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
