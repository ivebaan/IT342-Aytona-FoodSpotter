import { useEffect, useState, useMemo } from "react";
import { getStalls } from "../features/stalls/api/stalls";
import { CUISINE_OPTIONS } from "../constants/cuisineOptions";
import AppLayout from "../components/AppLayout";

export default function Explore() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center border-b border-gray-100">
                    <div className="text-5xl">🍽️</div>
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

                    <button className="w-full px-3 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mt-2">
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
    </AppLayout>
  );
}
