import AppLayout from "../components/AppLayout";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const profileUser = user || {};
  const fullName =
    [profileUser.firstname, profileUser.lastname].filter(Boolean).join(" ") ||
    "FoodSpotter User";
  const initials =
    `${profileUser.firstname?.[0] || "F"}${profileUser.lastname?.[0] || "S"}`.toUpperCase();

  return (
    <AppLayout title="Profile" subtitle="Your account details and app activity">
      <div className="max-w-4xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 text-white shadow-lg">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-bold shadow-sm backdrop-blur-sm">
                {initials}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/80">
                  Account Profile
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight">
                  {fullName}
                </h2>
                <p className="mt-1 text-sm text-white/85">
                  {profileUser.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Role
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {profileUser.role || "USER"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold">Active</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm col-span-2 sm:col-span-1">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Member
                </p>
                <p className="mt-1 text-sm font-semibold">FoodSpotter</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Information
                </h3>
                <p className="text-sm text-gray-500">
                  Your basic profile details.
                </p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                Profile Overview
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  First Name
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {profileUser.firstname || "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Last Name
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {profileUser.lastname || "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email Address
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {profileUser.email || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Useful account shortcuts.
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
                  Explore nearby food spots
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                  Manage your favorites
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  Update your preferences
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Account Role
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {profileUser.role === "OWNER"
                  ? "You have full management access across the platform."
                  : profileUser.role === "VENDOR"
                    ? "You can manage your stall listings and updates."
                    : "You can explore food spots and save your favorites."}
              </p>

              <div className="mt-4 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                {profileUser.role || "USER"}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
