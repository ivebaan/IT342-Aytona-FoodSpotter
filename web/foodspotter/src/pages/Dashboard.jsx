import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createStall, getStalls, updateStall } from "../features/stalls/api/stalls";
import {
  formatCurrency,
  getStallImage,
  getStallMenu,
  getStallVisual,
} from "../features/stalls/utils/stallPresentation";
import { CUISINE_OPTIONS } from "../constants/cuisineOptions";
import AppLayout from "../components/AppLayout";

const draftPinIcon = L.divIcon({
  className: "",
  html: '<div style="width:44px;height:44px;border-radius:9999px;background:#0ea5e9;border:3px solid #ffffff;box-shadow:0 10px 20px rgba(15,23,42,.30);display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;">📍</div>',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -42],
});

const parseMenuEditorText = (text) =>
  String(text || "")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", price = "", description = "", imageUrl = ""] = line
        .split("|")
        .map((part) => part.trim());

      return {
        name,
        price,
        description,
        imageUrl,
      };
    })
    .filter((item) => item.name);

const formatMenuEditorText = (menuJson) => {
  try {
    const parsed = JSON.parse(menuJson || "[]");
    if (!Array.isArray(parsed)) return "";

    return parsed
      .map((item) => {
        const price = item.price == null || item.price === "" ? "" : item.price;
        return [item.name || "", price, item.description || "", item.imageUrl || ""]
          .map((part) => String(part).trim())
          .join(" | ")
          .replace(/\s+\|\s+\|/g, " | ")
          .replace(/\|\s*$/g, "")
          .trim();
      })
      .join("\n");
  } catch {
    return "";
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [stallEditForm, setStallEditForm] = useState({
    name: "",
    description: "",
    cuisine: "",
    imageUrl: "",
    menuText: "",
  });
  const [stallEditError, setStallEditError] = useState("");
  const [stallEditSuccess, setStallEditSuccess] = useState("");
  const [stallSaving, setStallSaving] = useState(false);
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
  const [isVendorPanelCollapsed, setIsVendorPanelCollapsed] = useState(false);
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

  const buildStallMarkerIcon = (stall, favorite = false) => {
    const visual = getStallVisual(stall?.cuisine || stall?.type);
    const ringColor = favorite ? "#be123c" : "#ffffff";
    const ringWidth = favorite ? 4 : 3;
    const html = `<div style="width:44px;height:44px;border-radius:9999px;background:${visual.color};border:${ringWidth}px solid ${ringColor};box-shadow:0 10px 20px rgba(15,23,42,.30);display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;">${visual.emoji}</div>`;

    return L.divIcon({
      className: "",
      html,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -42],
    });
  };

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
      const marker = L.marker([lat, lng], { icon: draftPinIcon }).addTo(map);
      marker
        .bindPopup(
          `📍 New stall location selected<br/>Lat: ${lat.toFixed(5)}<br/>Lng: ${lng.toFixed(5)}`,
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

  // Favorite helpers (stored in localStorage)
  const FAVORITES_KEY = "favorites";

  const getFavorites = () => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch (e) {
      return [];
    }
  };

  const saveFavorites = (arr) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr || []));
  };

  const isFavorite = (id) => {
    if (id == null) return false;
    return getFavorites().some((f) => f.id === id);
  };

  const addFavorite = (stall) => {
    const favs = getFavorites();
    if (!favs.some((f) => f.id === stall.id)) {
      favs.push(stall);
      saveFavorites(favs);
    }
  };

  const removeFavorite = (id) => {
    const favs = getFavorites().filter((f) => f.id !== id);
    saveFavorites(favs);
  };

  const toggleFavorite = (stall, marker) => {
    if (!stall || stall.id == null) return;
    if (isFavorite(stall.id)) {
      removeFavorite(stall.id);
      updateMarkerIcon(marker, stall, false);
    } else {
      addFavorite(stall);
      updateMarkerIcon(marker, stall, true);
    }
    const btn = document.getElementById(`fav-btn-${stall.id}`);
    if (btn) {
      btn.textContent = isFavorite(stall.id) ? "Remove Favorite" : "Add Favorite";
    }
    window.dispatchEvent(new Event("storage"));
  };

  const updateMarkerIcon = (marker, stall, fav) => {
    if (!marker) return;
    marker.setIcon(buildStallMarkerIcon(stall, fav));
  };

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

      const favorite = isFavorite(stall.id);
      const marker = L.marker([stall.latitude, stall.longitude], {
        icon: buildStallMarkerIcon(stall, favorite),
      }).addTo(map);

      const favLabel = isFavorite(stall.id) ? "Remove Favorite" : "Add Favorite";
      const popupHtml = `
        <div style="min-width:220px;max-width:260px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
          <div style="padding:2px 0 4px;">
            <div style="font-size:15px;font-weight:700;color:#111827;line-height:1.2;">${stall.name}</div>
            <div style="margin-top:6px;display:inline-block;padding:4px 9px;border-radius:999px;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:11px;font-weight:600;">
              ${stall.cuisine || "Cuisine N/A"}
            </div>
            <p style="margin:8px 0 0;color:#4b5563;font-size:12px;line-height:1.45;">
              ${stall.description || "No description provided."}
            </p>
          </div>

          <div style="margin-top:10px;display:flex;gap:8px;">
            <button id="fav-btn-${stall.id}" style="flex:1;padding:8px 10px;border-radius:10px;border:1px solid #fecaca;background:#fff1f2;color:#be123c;cursor:pointer;font-size:12px;font-weight:600;box-shadow:0 1px 2px rgba(15,23,42,.08);transition:all .2s ease;">
              ${favLabel}
            </button>
            <button id="nav-btn-${stall.id}" style="flex:1;padding:8px 10px;border-radius:10px;border:1px solid #fdba74;background:linear-gradient(180deg,#fb923c 0%, #f97316 100%);color:#fff;cursor:pointer;font-size:12px;font-weight:700;box-shadow:0 4px 12px rgba(249,115,22,.35);transition:all .2s ease;">
              Open
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: "foodspotter-popup", closeButton: true });
      markersRef.current.push(marker);

      marker.on("popupopen", () => {
        // attach favorite toggle handler
        setTimeout(() => {
          const favBtn = document.getElementById(`fav-btn-${stall.id}`);
          if (favBtn) {
            favBtn.onclick = () => toggleFavorite(stall, marker);
          }
          const navBtn = document.getElementById(`nav-btn-${stall.id}`);
          if (navBtn) {
            navBtn.onclick = () => {
              map.setView([stall.latitude, stall.longitude], 17);
              setSelectedStall(stall);
            };
          }
        }, 0);
      });
    });
  }, [stalls]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setFormSuccess("");
  };

  const selectedStallMenu = selectedStall ? getStallMenu(selectedStall) : [];
  const canEditSelectedStall =
    Boolean(selectedStall?.ownerEmail) &&
    Boolean(currentUser.email) &&
    selectedStall.ownerEmail.toLowerCase() === currentUser.email.toLowerCase() &&
    (currentUser.role === "VENDOR" || currentUser.role === "OWNER");

  useEffect(() => {
    if (!selectedStall || !canEditSelectedStall) {
      setStallEditForm({
        name: "",
        description: "",
        cuisine: "",
        imageUrl: "",
        menuText: "",
      });
      setStallEditError("");
      setStallEditSuccess("");
      return;
    }

    setStallEditForm({
      name: selectedStall.name || "",
      description: selectedStall.description || "",
      cuisine: selectedStall.cuisine || "",
      imageUrl: selectedStall.imageUrl || "",
      menuText: formatMenuEditorText(selectedStall.menuJson) ||
        selectedStallMenu
          .map((item) => [item.name || "", item.price ?? "", item.description || "", item.imageUrl || ""]
            .map((part) => String(part).trim())
            .join(" | ")
            .replace(/\s+\|\s+\|/g, " | ")
            .replace(/\|\s*$/g, "")
            .trim())
          .join("\n"),
    });
  }, [selectedStall, canEditSelectedStall]);

  const handleStallEditChange = (e) => {
    const { name, value } = e.target;
    setStallEditForm((prev) => ({ ...prev, [name]: value }));
    setStallEditError("");
    setStallEditSuccess("");
  };

  const handleSaveStallCustomization = async (e) => {
    e.preventDefault();

    if (!selectedStall) return;

    if (!canEditSelectedStall) {
      setStallEditError("You can only edit your own stall.");
      return;
    }

    const name = stallEditForm.name.trim();
    const description = stallEditForm.description.trim();
    const cuisine = stallEditForm.cuisine.trim();
    const imageUrl = stallEditForm.imageUrl.trim();

    if (!name || !description || !cuisine) {
      setStallEditError("Name, description, and cuisine are required.");
      return;
    }

    const menuItems = parseMenuEditorText(stallEditForm.menuText);

    try {
      setStallSaving(true);
      setStallEditError("");
      setStallEditSuccess("");

      const token = localStorage.getItem("token");
      if (!token) {
        setStallEditError("You need to be logged in.");
        return;
      }

      const response = await updateStall(token, selectedStall.id, {
        name,
        description,
        cuisine,
        imageUrl: imageUrl || null,
        menuJson: JSON.stringify(menuItems),
      });

      if (response && response.success && response.data) {
        setStalls((prev) =>
          prev.map((stall) => (stall.id === response.data.id ? response.data : stall)),
        );
        setSelectedStall(response.data);
        setStallEditSuccess("Your stall was updated successfully.");
      }
    } catch (error) {
      console.error("Failed to update stall:", error);
      const message = error.response?.data?.error?.message || error.message;
      setStallEditError(message || "Unable to update your stall.");
    } finally {
      setStallSaving(false);
    }
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

        {/* Right-side panels */}
        <div className="fixed left-4 right-4 md:left-auto md:right-4 md:w-[24rem] top-20 bottom-4 z-1200 flex flex-col gap-3 pointer-events-none">
          {selectedStall && (
            <div className="pointer-events-auto overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
              <div className="relative">
                <img
                  src={getStallImage(selectedStall)}
                  alt={selectedStall.name || "Stall"}
                  loading="lazy"
                  className="h-40 w-full object-cover"
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
                  onClick={() => setSelectedStall(null)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-white"
                >
                  Close
                </button>
              </div>

              <div className="max-h-[38vh] overflow-y-auto p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-800">{selectedStall.name}</h3>
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                    {getStallVisual(selectedStall.cuisine).label}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{selectedStall.description || "No description provided."}</p>

                <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Cuisine / Category</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">{selectedStall.cuisine || "General"}</p>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Complete Menu</p>
                  <div className="mt-2 space-y-2">
                    {selectedStallMenu.map((item, idx) => (
                      <div key={`${item.name}-${idx}`} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            loading="lazy"
                            className="h-28 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <div className="px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs font-bold text-orange-600">{formatCurrency(item.price)}</p>
                          </div>
                          {item.description && (
                            <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {canEditSelectedStall && (
                  <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-orange-800">Edit your stall</p>
                        <p className="text-[11px] text-orange-700/80">
                          Only the creator of this stall can change these details.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                        Owner only
                      </span>
                    </div>

                    {stallEditError && (
                      <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {stallEditError}
                      </div>
                    )}

                    {stallEditSuccess && (
                      <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                        {stallEditSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSaveStallCustomization} className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-orange-900/80">Stall picture URL</label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={stallEditForm.imageUrl}
                          onChange={handleStallEditChange}
                          placeholder="https://..."
                          className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-orange-900/80">Menu items</label>
                        <textarea
                          name="menuText"
                          rows={5}
                          value={stallEditForm.menuText}
                          onChange={handleStallEditChange}
                          placeholder="Name | Price | Description | Image URL (optional)\nExample: Silog Special | 95 | With egg and rice | https://..."
                          className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <p className="text-[11px] text-orange-700/70">
                          One item per line. Separate fields using <span className="font-semibold">|</span>.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={stallSaving}
                          className="inline-flex flex-1 items-center justify-center rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {stallSaving ? "Saving..." : "Save stall details"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pointer-events-auto overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {showVendorForm ? "Vendor Onboarding" : "Vendor Setup"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {isVendorPanelCollapsed
                    ? "Tap the arrow to expand"
                    : "Provide stall details to register your business"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsVendorPanelCollapsed((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                aria-label={isVendorPanelCollapsed ? "Expand panel" : "Collapse panel"}
                title={isVendorPanelCollapsed ? "Expand" : "Collapse"}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isVendorPanelCollapsed ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 15 6-6 6 6" />
                </svg>
              </button>
            </div>

            {!isVendorPanelCollapsed && (
              <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-6 space-y-6">
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
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
