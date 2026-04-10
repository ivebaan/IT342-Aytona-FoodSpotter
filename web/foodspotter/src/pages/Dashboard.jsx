import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createStall, getStalls } from "../api/stalls";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [stalls, setStalls] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisine: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = [10.3157, 123.8854]; // Example: Cebu City

    const map = L.map(mapContainerRef.current).setView(initialCenter, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const marker = L.marker([lat, lng]).addTo(map);
      marker
        .bindPopup(
          `🍜 Food stall here!<br/>Lat: ${lat.toFixed(5)}<br/>Lng: ${lng.toFixed(5)}`,
        )
        .openPopup();

      setSelectedLocation({ lat, lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.off();
      map.remove();
    };
  }, []);

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

      const marker = L.marker([stall.latitude, stall.longitude]).addTo(map);
      marker.bindPopup(
        `<strong>${stall.name}</strong><br/>${stall.description || ""}<br/>Cuisine: ${stall.cuisine}`,
      );
      markersRef.current.push(marker);
    });
  }, [stalls]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateStall = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please select a location on the map first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add a stall.");
      navigate("/login");
      return;
    }

    if (!form.name || !form.description || !form.cuisine) {
      alert("Please fill in all stall details.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        description: form.description,
        cuisine: form.cuisine,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      };

      const response = await createStall(token, payload);

      if (response && response.success && response.data) {
        setStalls((prev) => [...prev, response.data]);
        setForm({ name: "", description: "", cuisine: "" });
        alert("Stall submitted successfully! It will appear once approved.");
      }
    } catch (error) {
      console.error("Failed to create stall:", error);
      alert("Failed to create stall. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-500 rounded-full p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-800">FoodSpotter</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.firstname} {user.lastname}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-4 py-2 rounded-lg transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user.firstname}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Ready to discover your next favourite food spot?
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Account Info
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Name</span>
                <span className="text-gray-800 font-medium">
                  {user.firstname} {user.lastname}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-800 font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Role</span>
                <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Add Stall Form */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Add new stall
              </h3>
              <form onSubmit={handleCreateStall} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500">
                    Stall name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Juan's Tapsilog"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500">
                    Cuisine
                  </label>
                  <input
                    type="text"
                    name="cuisine"
                    value={form.cuisine}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Filipino, Korean, Cafe, etc."
                  />
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Short description of the stall"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Submitting…"
                    : "Submit stall (uses selected pin)"}
                </button>
                <p className="text-[11px] text-gray-400">
                  Tip: Click on the map to choose the exact location first.
                </p>
              </form>
            </div>
          </div>

          {/* Map card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Food map</h2>
              <span className="text-xs text-gray-400">
                Click on the map to drop a new pin.
              </span>
            </div>
            <div
              ref={mapContainerRef}
              className="w-full rounded-xl overflow-hidden border border-gray-100"
              style={{ height: "460px" }}
            />
            {selectedLocation && (
              <p className="mt-3 text-xs text-gray-500">
                Selected location: lat {selectedLocation.lat.toFixed(5)}, lng{" "}
                {selectedLocation.lng.toFixed(5)}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
