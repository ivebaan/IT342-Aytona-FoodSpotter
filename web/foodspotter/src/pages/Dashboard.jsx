import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createStall, getStalls } from "../api/stalls";
import { CUISINE_OPTIONS } from "../constants/cuisineOptions";
import AppLayout from "../components/AppLayout";

const foodPinIcon = L.divIcon({
  className: "",
  html: '<div style="width:44px;height:44px;border-radius:9999px;background:#f97316;border:3px solid #ffffff;box-shadow:0 10px 20px rgba(15,23,42,.30);display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;">🍜</div>',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -42],
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [stalls, setStalls] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLoadError, setMapLoadError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisine: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(
    currentUser.role === "VENDOR" || currentUser.role === "OWNER",
  );

  const configuredTileUrl = import.meta.env.VITE_MAP_TILE_URL;
  const configuredAttribution = import.meta.env.VITE_MAP_ATTRIBUTION;
  const isValidTileUrl =
    typeof configuredTileUrl === "string" &&
    configuredTileUrl.includes("{z}") &&
    configuredTileUrl.includes("{x}") &&
    configuredTileUrl.includes("{y}");
  const primaryTileUrl = isValidTileUrl
    ? configuredTileUrl
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const primaryAttribution =
    configuredAttribution || "© OpenStreetMap contributors";

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = [10.3157, 123.8854]; // Example: Cebu City

    const map = L.map(mapContainerRef.current).setView(initialCenter, 13);

    const primaryTiles = L.tileLayer(primaryTileUrl, {
      attribution: primaryAttribution,
      maxZoom: 19,
    });

    const fallbackTiles = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap contributors © CARTO",
        maxZoom: 20,
        subdomains: "abcd",
      },
    );

    primaryTiles.on("tileerror", () => {
      if (!map.hasLayer(fallbackTiles)) {
        fallbackTiles.addTo(map);
      }
      setMapLoadError(
        "Map tiles could not be loaded from OpenStreetMap. Fallback tiles are being used.",
      );
    });

    primaryTiles.on("load", () => {
      setMapLoadError("");
    });

    primaryTiles.addTo(map);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    map.whenReady(() => {
      setTimeout(() => map.invalidateSize(), 0);
    });

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const marker = L.marker([lat, lng], { icon: foodPinIcon }).addTo(map);
      marker
        .bindPopup(
          `🍜 Food stall here!<br/>Lat: ${lat.toFixed(5)}<br/>Lng: ${lng.toFixed(5)}`,
        )
        .openPopup();

      setSelectedLocation({ lat, lng });
    });

    mapInstanceRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.off();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [primaryAttribution, primaryTileUrl]);

  // Load stalls from backend and add markers
  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await getStalls(token);
        if (response && response.success) {
          setStalls(response.data || []);
        }
      } catch (error) {
        console.error("Failed to load stalls for map:", error);
      }
    };

    fetchStalls();
  }, []);

  // Add markers for loaded stalls
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    stalls.forEach((stall) => {
      if (stall.latitude == null || stall.longitude == null) return;

      const marker = L.marker([stall.latitude, stall.longitude], {
        icon: foodPinIcon,
      }).addTo(map);
      marker.bindPopup(
        `<strong>${stall.name}</strong><br/>${stall.description || ""}<br/>Cuisine: ${stall.cuisine}`,
      );
      markersRef.current.push(marker);
    });
  }, [stalls]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setFormSuccess("");
  };

  const handleCreateStall = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();
    const cuisine = form.cuisine;

    if (!selectedLocation) {
      setFormError("Please select a location on the map first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("You must be logged in to add a stall.");
      navigate("/login");
      return;
    }

    if (!name || !description || !cuisine) {
      setFormError("Please fill in all stall details.");
      return;
    }

    if (name.length < 3) {
      setFormError("Stall name must be at least 3 characters.");
      return;
    }

    if (description.length < 10) {
      setFormError("Description must be at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setFormSuccess("");
      const payload = {
        name,
        description,
        cuisine,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      };

      const response = await createStall(token, payload);

      if (response && response.success && response.data) {
        const updatedUser = {
          ...currentUser,
          role: "VENDOR",
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setShowVendorForm(true);

        setStalls((prev) => [...prev, response.data]);
        setForm({ name: "", description: "", cuisine: "" });
        setFormSuccess(
          "Business registration submitted. Your account is now tagged as VENDOR. Listing will appear once approved.",
        );
      }
    } catch (error) {
      console.error("Failed to create stall:", error);
      const errData = error.response?.data?.error;
      setFormError(
        errData?.details ||
          errData?.message ||
          "Failed to create stall. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout fullScreen={true}>
      <div className="relative w-full h-full flex">
        {/* Map - Full screen */}
        <div className="flex-1 relative">
          <div
            ref={mapContainerRef}
            className="w-full h-full rounded-none overflow-hidden"
          />
          {mapLoadError && (
            <div className="absolute bottom-4 left-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-600 max-w-xs">
              {mapLoadError}
            </div>
          )}
          {selectedLocation && (
            <div className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600">
              Selected: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
            </div>
          )}
        </div>

        {/* Form - Floating panel on bottom right */}
        <div className="fixed bottom-4 right-4 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-6 z-1200 pointer-events-auto">
          {!showVendorForm && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Become a Vendor
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  You are currently a regular user. Choose an action to start your
                  vendor onboarding.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowVendorForm(true)}
                className="w-full rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Add Your Stall
              </button>

              <button
                type="button"
                onClick={() => setShowVendorForm(true)}
                className="w-full rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
              >
                Register Your Business
              </button>

              <p className="text-xs text-gray-400">
                After submitting stall details, your role will automatically
                update to VENDOR.
              </p>
            </div>
          )}

          {showVendorForm && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Vendor Onboarding
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Provide your stall name, location, and stall type to register
                your business.
              </p>
            <form onSubmit={handleCreateStall} className="space-y-3">
              {formSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                  {formSuccess}
                </div>
              )}

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  Stall name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  minLength={3}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Juan's Tapsilog"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  Cuisine
                </label>
                <select
                  name="cuisine"
                  value={form.cuisine}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select cuisine type</option>
                  {CUISINE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={handleFormChange}
                  minLength={10}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Short description of the stall"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit stall (uses selected pin)"}
              </button>
              <p className="text-[11px] text-gray-400">
                Tip: Click on the map to choose the exact location first.
              </p>
            </form>

            <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Current role: {currentUser.role || "USER"}
            </div>
          </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
