import AppLayout from "../components/AppLayout";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <AppLayout title="Profile" subtitle="Your account details.">
      <section className="max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Account Info
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">First name</span>
            <span className="text-gray-800 font-medium">
              {user.firstname || "-"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Last name</span>
            <span className="text-gray-800 font-medium">
              {user.lastname || "-"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Email</span>
            <span className="text-gray-800 font-medium">{user.email || "-"}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Role</span>
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              {user.role || "USER"}
            </span>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
