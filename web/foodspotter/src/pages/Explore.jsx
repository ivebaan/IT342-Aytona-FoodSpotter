import { useEffect, useState, useMemo } from "react";
import { getStalls } from "../features/stalls/api/stalls";
import { CUISINE_OPTIONS } from "../constants/cuisineOptions";
import AppLayout from "../components/AppLayout";
import {
  formatCurrency,
  getStallImage,
  getStallMenu,
} from "../features/stalls/utils/stallPresentation";

export default function Explore() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStall, setSelectedStall] = useState(null);

  useEffect(() => {
    const loadStalls = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await getStalls(token);

        if (Array.isArray(response)) {
          setStalls(response);
          return;
        }

        if (response && response.success && Array.isArray(response.data)) {
          setStalls(response.data);
          return;
        }

        setStalls([]);
      } catch (error) {
        console.error("Error loading stalls:", error);
        setStalls([]);
      } finally {
        setLoading(false);
      }
    };

    loadStalls();
  }, []);

  const filteredStalls = useMemo(() => {
    const stallList = Array.isArray(stalls) ? stalls : [];

    return stallList.filter((stall) => {
      // Filter by cuisine
      if (
        selectedCuisines.length > 0 &&
        !selectedCuisines.includes(stall.cuisine)
      ) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          stall.name.toLowerCase().includes(query) ||
          (stall.description &&
            stall.description.toLowerCase().includes(query)) ||
          (stall.cuisine && stall.cuisine.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [stalls, selectedCuisines, searchQuery]);

  const toggleCuisine = (cuisine) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine],
    );
  };

  const clearFilters = () => {
    setSelectedCuisines([]);
    setSearchQuery("");
  };

  const closeDetails = () => setSelectedStall(null);
  const selectedStallMenu = selectedStall ? getStallMenu(selectedStall) : [];

  return (
    <AppLayout title="Explore" subtitle="Discover food spots by cuisine">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6 bg-white rounded-2xl border border-gray-100 p-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Search</h3>
              <input
                type="text"
                placeholder="Search by name or cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Cuisines</h3>
                {selectedCuisines.length > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    {selectedCuisines.length}
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {CUISINE_OPTIONS.map((cuisine) => (
                  <label
                    key={cuisine}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCuisines.includes(cuisine)}
                      onChange={() => toggleCuisine(cuisine)}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{cuisine}</span>
                  </label>
                ))}
              </div>
            </div>

            {(selectedCuisines.length > 0 || searchQuery) && (
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Stalls Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading food spots...</div>
            </div>
          ) : filteredStalls.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-gray-100">
              <div className="text-gray-400 text-center">
                <p className="text-lg font-medium mb-1">No food spots found</p>
                <p className="text-sm">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStalls.map((stall) => (
                <div
                  key={stall.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="aspect-video bg-gray-100 border-b border-gray-100 overflow-hidden">
                    <img
                      src={getStallImage(stall)}
                      alt={stall.name || "Food spot"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = getStallImage({
                          ...stall,
                          imageUrl: "",
                          photoUrl: "",
                        });
                      }}
                    />
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base line-clamp-2">
                        {stall.name}
                      </h3>
                      {stall.cuisine && (
                        <p className="text-xs text-orange-600 font-medium mt-1">
                          {stall.cuisine}
                        </p>
                      )}
                    </div>

                    {stall.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {stall.description}
                      </p>
                    )}

                    {stall.latitude && stall.longitude && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>
                          {stall.latitude.toFixed(4)},{" "}
                          {stall.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedStall(stall)}
                      className="w-full px-3 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mt-2"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredStalls.length} of {stalls.length} food spots
          </div>
        </div>
      </div>

      {selectedStall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
            <div className="relative">
              <img
                src={getStallImage(selectedStall)}
                alt={selectedStall.name || "Food spot"}
                className="h-64 w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = getStallImage({
                    ...selectedStall,
                    imageUrl: "",
                    photoUrl: "",
                  });
                }}
              />
              <button
                type="button"
                onClick={closeDetails}
                className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md hover:bg-white"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedStall.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-orange-600">
                    {selectedStall.cuisine || "Cuisine not set"}
                  </p>
                </div>
                {selectedStall.status && (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                    {String(selectedStall.status).toUpperCase()}
                  </span>
                )}
              </div>

              <p className="text-sm leading-6 text-gray-600">
                {selectedStall.description || "No description provided."}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Menu
                  </h4>
                  <span className="text-xs text-gray-400">
                    {selectedStallMenu.length} item
                    {selectedStallMenu.length === 1 ? "" : "s"}
                  </span>
                </div>

                {selectedStallMenu.length === 0 ? (
                  <p className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    No menu items were provided for this stall.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedStallMenu.map((item, index) => (
                      <div
                        key={`${item.name || "item"}-${index}`}
                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                      >
                        <div className="h-28 w-full overflow-hidden bg-gray-100">
                          <img
                            src={item.imageUrl || getStallImage(selectedStall)}
                            alt={item.name || "Menu item"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = getStallImage(selectedStall);
                            }}
                          />
                        </div>
                        <div className="space-y-1 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.name || "Menu Item"}
                            </p>
                            <p className="text-xs font-bold text-orange-600">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                          {item.description && (
                            <p className="text-xs leading-5 text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Owner:</span>{" "}
                  {selectedStall.ownerEmail || "-"}
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Address:</span>{" "}
                  {selectedStall.address || "-"}
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Location:</span>{" "}
                  {selectedStall.latitude?.toFixed?.(5) ?? selectedStall.latitude},{" "}
                  {selectedStall.longitude?.toFixed?.(5) ?? selectedStall.longitude}
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">Image:</span>{" "}
                  {selectedStall.imageUrl ? "Provided" : "Generated placeholder"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
