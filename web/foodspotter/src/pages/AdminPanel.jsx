import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  approveStall,
  clearStallMenu,
  getAdminStalls,
  getPendingStalls,
  rejectStall,
} from "../features/stalls/api/stalls";
import { getStallImage } from "../features/stalls/utils/stallPresentation";

const statusStyles = {
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

function statusLabel(status) {
  if (!status) return "PENDING";
  return String(status).toUpperCase();
}

function getStoredMenuItems(stall) {
  if (!stall?.menuJson) return [];

  try {
    const parsed =
      typeof stall.menuJson === "string"
        ? JSON.parse(stall.menuJson)
        : stall.menuJson;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function StallCard({ stall, onApprove, onReject, onClearMenu, actionBusyId }) {
  const status = statusLabel(stall.status);
  const isPending = status === "PENDING";
  const isApproved = status === "APPROVED";
  const menuItems = getStoredMenuItems(stall);
  const hasMenu = menuItems.length > 0;
  const stallImage = getStallImage(stall);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
        <img
          src={stallImage}
          alt={stall.name || "Submitted stall"}
          className="h-48 w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = getStallImage({
              ...stall,
              imageUrl: "",
              photoUrl: "",
            });
          }}
        />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {stall.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {stall.cuisine || "Cuisine not set"}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles[status] || statusStyles.PENDING}`}
        >
          {status}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
        {stall.description || "No description provided."}
      </p>

      <div className="mt-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 px-3 py-2">
          <span className="font-semibold text-gray-700">Image:</span>{" "}
          {stall.imageUrl ? "Provided" : "Generated placeholder"}
        </div>
        <div className="rounded-2xl bg-gray-50 px-3 py-2">
          <span className="font-semibold text-gray-700">Address:</span>{" "}
          {stall.address || "-"}
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 px-3 py-2">
          <span className="font-semibold text-gray-700">Owner:</span>{" "}
          {stall.ownerEmail || "-"}
        </div>
        <div className="rounded-2xl bg-gray-50 px-3 py-2">
          <span className="font-semibold text-gray-700">Location:</span>{" "}
          {stall.latitude?.toFixed?.(4) ?? stall.latitude},{" "}
          {stall.longitude?.toFixed?.(4) ?? stall.longitude}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-gray-50 px-3 py-3 text-xs text-gray-600">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-gray-700">Menu Items</span>
          <span className="rounded-full bg-white px-2 py-1 font-semibold text-gray-700">
            {menuItems.length}
          </span>
        </div>
        <p className="mt-2 line-clamp-2">
          {hasMenu
            ? menuItems.map((item) => item.name).join(", ")
            : "No menu items attached."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {isPending && (
          <>
            <button
              type="button"
              onClick={() => onApprove(stall.id)}
              disabled={actionBusyId === `approve-${stall.id}`}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionBusyId === `approve-${stall.id}`
                ? "Approving..."
                : "Approve"}
            </button>
            <button
              type="button"
              onClick={() => onReject(stall.id)}
              disabled={actionBusyId === `reject-${stall.id}`}
              className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actionBusyId === `reject-${stall.id}`
                ? "Rejecting..."
                : "Reject"}
            </button>
          </>
        )}

        {isApproved && (
          <button
            type="button"
            onClick={() => onReject(stall.id)}
            disabled={actionBusyId === `reject-${stall.id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionBusyId === `reject-${stall.id}`
              ? "Removing..."
              : "Reject / Remove"}
          </button>
        )}

        {hasMenu && (
          <button
            type="button"
            onClick={() => onClearMenu(stall.id)}
            disabled={actionBusyId === `clear-menu-${stall.id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionBusyId === `clear-menu-${stall.id}`
              ? "Clearing..."
              : "Remove Menu"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [allStalls, setAllStalls] = useState([]);
  const [pendingStalls, setPendingStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionBusyId, setActionBusyId] = useState("");

  const token = localStorage.getItem("token");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [allResponse, pendingResponse] = await Promise.all([
        getAdminStalls(token),
        getPendingStalls(token),
      ]);

      setAllStalls(Array.isArray(allResponse?.data) ? allResponse.data : []);
      setPendingStalls(
        Array.isArray(pendingResponse?.data) ? pendingResponse.data : [],
      );
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to load stalls.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const stalls = Array.isArray(allStalls) ? allStalls : [];
    return {
      total: stalls.length,
      pending: stalls.filter((stall) => statusLabel(stall.status) === "PENDING")
        .length,
      approved: stalls.filter(
        (stall) => statusLabel(stall.status) === "APPROVED",
      ).length,
      rejected: stalls.filter(
        (stall) => statusLabel(stall.status) === "REJECTED",
      ).length,
    };
  }, [allStalls]);

  const filteredAllStalls = useMemo(() => {
    const stalls = Array.isArray(allStalls) ? allStalls : [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) return stalls;

    return stalls.filter((stall) => {
      const haystack = [
        stall.name,
        stall.description,
        stall.cuisine,
        stall.ownerEmail,
        stall.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [allStalls, searchQuery]);

  const handleApprove = async (id) => {
    if (!token) return;

    try {
      setActionBusyId(`approve-${id}`);
      await approveStall(token, id);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to approve stall.",
      );
    } finally {
      setActionBusyId("");
    }
  };

  const handleClearMenu = async (id) => {
    if (!token) return;
    if (
      !confirm(
        "Remove all menu items from this stall? The stall itself will stay published.",
      )
    )
      return;

    try {
      setActionBusyId(`clear-menu-${id}`);
      await clearStallMenu(token, id);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to clear menu.",
      );
    } finally {
      setActionBusyId("");
    }
  };

  const handleReject = async (id) => {
    if (!token) return;
    if (
      !confirm(
        "Reject this stall? It will be removed from the map and admin list.",
      )
    )
      return;

    try {
      setActionBusyId(`reject-${id}`);
      await rejectStall(token, id);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to reject stall.",
      );
    } finally {
      setActionBusyId("");
    }
  };

  return (
    <AppLayout
      title="Admin Panel"
      subtitle="Review submitted stalls and manage approvals"
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Total Submitted
            </p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {stats.total}
            </p>
          </div>
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Pending
            </p>
            <p className="mt-2 text-3xl font-black text-amber-800">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Approved
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-800">
              {stats.approved}
            </p>
          </div>
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Rejected
            </p>
            <p className="mt-2 text-3xl font-black text-rose-800">
              {stats.rejected}
            </p>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  All Submitted Stalls
                </h2>
                <p className="text-sm text-gray-500">
                  Search every stall submission, including approved and pending
                  records.
                </p>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stalls, owners, cuisine..."
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:w-80"
              />
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
                Loading stall submissions...
              </div>
            ) : filteredAllStalls.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
                No stalls found.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAllStalls.map((stall) => (
                  <StallCard
                    key={stall.id}
                    stall={stall}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onClearMenu={handleClearMenu}
                    actionBusyId={actionBusyId}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Reviews
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                These are the new stall submissions waiting for approval.
              </p>

              <div className="mt-4 space-y-4">
                {pendingStalls.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    No pending stalls right now.
                  </div>
                ) : (
                  pendingStalls.map((stall) => (
                    <div
                      key={stall.id}
                      className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4"
                    >
                      <div className="mb-3 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
                        <img
                          src={getStallImage(stall)}
                          alt={stall.name || "Pending stall"}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src = getStallImage({
                              ...stall,
                              imageUrl: "",
                              photoUrl: "",
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {stall.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {stall.cuisine || "Cuisine not set"}
                          </p>
                        </div>
                        <span className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Pending
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {stall.description || "No description provided."}
                      </p>

                      <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white px-3 py-2">
                          <span className="font-semibold text-gray-700">Image:</span>{" "}
                          {stall.imageUrl ? "Provided" : "Generated placeholder"}
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2">
                          <span className="font-semibold text-gray-700">Address:</span>{" "}
                          {stall.address || "-"}
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(stall.id)}
                          disabled={actionBusyId === `approve-${stall.id}`}
                          className="flex-1 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionBusyId === `approve-${stall.id}`
                            ? "Approving..."
                            : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(stall.id)}
                          disabled={actionBusyId === `reject-${stall.id}`}
                          className="flex-1 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionBusyId === `reject-${stall.id}`
                            ? "Rejecting..."
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-gray-100 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">
                How this works
              </h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-gray-700">
                <li>
                  • Pending stalls appear with amber map pins and in this review
                  queue.
                </li>
                <li>
                  • Approved stalls switch to green map pins and stay visible on
                  the map.
                </li>
                <li>
                  • Rejected stalls are deleted from the system and no longer
                  appear on the map.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
