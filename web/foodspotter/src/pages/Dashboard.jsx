import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  createStall,
  getStalls,
  updateStall,
} from "../features/stalls/api/stalls";
import {
  formatCurrency,
  getStallImage,
  getStallMenu,
  getStallVisual,
} from "../features/stalls/utils/stallPresentation";
import { CUISINE_OPTIONS } from "../constants/cuisineOptions";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  addFavorite as storeFavorite,
  readFavorites,
  removeFavorite as removeStoredFavorite,
} from "../features/favorites/favoritesStorage";

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
        return [
          item.name || "",
          price,
          item.description || "",
          item.imageUrl || "",
        ]
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
  const { user: currentUser } = useAuth();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const draftMarkerRef = useRef(null);

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
    imageUrl: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isVendorPanelCollapsed, setIsVendorPanelCollapsed] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);

  const normalizeErrorMessage = (value) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.filter(Boolean).join(", ");
    if (value && typeof value === "object") return Object.values(value).filter(Boolean).join(", ");
    return "Failed to create stall. Please try again.";
  };

  useEffect(() => {
    setShowVendorForm(
      currentUser?.role === "VENDOR" ||
        currentUser?.role === "OWNER" ||
        currentUser?.role === "ADMIN" ||
        currentUser?.role === "SUPER_ADMIN",
    );
  }, [currentUser?.role]);

  const clearSelectedLocation = () => {
    const map = mapInstanceRef.current;
    if (map && draftMarkerRef.current) {
      map.removeLayer(draftMarkerRef.current);
    }
    draftMarkerRef.current = null;
    setSelectedLocation(null);
  };

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
    const status = String(stall?.status || "PENDING").toUpperCase();
    const visual = getStallVisual(stall?.cuisine || stall?.type);
    const statusColors = {
      APPROVED: visual.color,
      PENDING: "#f59e0b",
      REJECTED: "#ef4444",
    };
    const statusEmoji = {
      APPROVED: visual.emoji,
      PENDING: "⌛",
      REJECTED: "✕",
    };
    const fillColor = statusColors[status] || visual.color;
    const emoji = statusEmoji[status] || visual.emoji;
    const ringColor = favorite ? "#be123c" : "#ffffff";
    const ringWidth = favorite ? 4 : 3;
    const html = `<div style="width:44px;height:44px;border-radius:9999px;background:${fillColor};border:${ringWidth}px solid ${ringColor};box-shadow:0 10px 20px rgba(15,23,42,.30);display:flex;align-items:center;justify-content:center;font-size:22px;line-height:1;">${emoji}</div>`;

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
      if (draftMarkerRef.current) {
        map.removeLayer(draftMarkerRef.current);
      }

      const marker = L.marker([lat, lng], { icon: draftPinIcon }).addTo(map);
      marker
        .bindPopup(
          `📍 New stall location selected<br/>Lat: ${lat.toFixed(5)}<br/>Lng: ${lng.toFixed(5)}`,
        )
        .openPopup();
      draftMarkerRef.current = marker;

      setSelectedLocation({ lat, lng });
    });

    mapInstanceRef.current = map;

    return () => {
      resizeObserver.disconnect();
      map.off();
      map.remove();
      mapInstanceRef.current = null;
      draftMarkerRef.current = null;
    };
  }, [primaryAttribution, primaryTileUrl]);

  const currentEmail = currentUser?.email || "";

  const isFavorite = (id) => {
    if (id == null) return false;
    return readFavorites(currentEmail).some((favorite) => favorite.id === id);
  };

  const addFavorite = (stall) => {
    storeFavorite(currentEmail, stall);
  };

  const removeFavorite = (id) => {
    removeStoredFavorite(currentEmail, id);
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
      btn.textContent = isFavorite(stall.id)
        ? "Remove Favorite"
        : "Add Favorite";
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
      if (String(stall?.status || "PENDING").toUpperCase() === "REJECTED")
        return;
      if (stall.latitude == null || stall.longitude == null) return;

      const favorite = isFavorite(stall.id);
      const marker = L.marker([stall.latitude, stall.longitude], {
        icon: buildStallMarkerIcon(stall, favorite),
      }).addTo(map);

      const favLabel = isFavorite(stall.id)
        ? "Remove Favorite"
        : "Add Favorite";
      const stallImage = getStallImage(stall);
      const stallMenu = getStallMenu(stall).slice(0, 3);
      const stallMenuHtml = stallMenu.length
        ? `
          <div style="margin-top:12px;border-top:1px solid #e5e7eb;padding-top:10px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">Menu Preview</div>
              <div style="font-size:10px;color:#9ca3af;">${stallMenu.length} item${stallMenu.length === 1 ? "" : "s"}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              ${stallMenu
                .map(
                  (item) => `
                    <div style="overflow:hidden;border:1px solid #e5e7eb;border-radius:12px;background:#fff;">
                      <div style="height:72px;background:#f3f4f6;overflow:hidden;">
                        <img src="${item.imageUrl || stallImage}" alt="${item.name || "Menu item"}" style="display:block;width:100%;height:100%;object-fit:cover;" />
                      </div>
                      <div style="padding:7px 8px 8px;">
                        <div style="font-size:11px;font-weight:700;color:#111827;line-height:1.25;">${item.name || "Menu Item"}</div>
                        <div style="margin-top:4px;font-size:10px;color:#f97316;font-weight:700;">${formatCurrency(item.price)}</div>
                      </div>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </div>
        `
        : `
          <div style="margin-top:12px;border-top:1px solid #e5e7eb;padding-top:10px;font-size:11px;color:#6b7280;">
            No menu items were provided.
          </div>
        `;
      const popupHtml = `
        <div style="min-width:220px;max-width:260px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
          <div style="overflow:hidden;border-radius:16px;border:1px solid #e5e7eb;background:#f9fafb;margin-bottom:10px;">
            <img src="${stallImage}" alt="${stall.name || "Stall"}" style="display:block;width:100%;height:120px;object-fit:cover;" />
          </div>
          <div style="padding:2px 0 4px;">
            <div style="font-size:15px;font-weight:700;color:#111827;line-height:1.2;">${stall.name}</div>
            <div style="margin-top:6px;display:inline-block;padding:4px 9px;border-radius:999px;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:11px;font-weight:600;">
              ${stall.cuisine || "Cuisine N/A"}
            </div>
            <div style="margin-top:6px;display:inline-block;padding:4px 9px;border-radius:999px;background:${String(stall.status || "PENDING").toUpperCase() === "APPROVED" ? "#ecfdf5" : "#fffbeb"};border:1px solid ${String(stall.status || "PENDING").toUpperCase() === "APPROVED" ? "#a7f3d0" : "#fcd34d"};color:${String(stall.status || "PENDING").toUpperCase() === "APPROVED" ? "#047857" : "#b45309"};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">
              ${stall.status || "PENDING"}
            </div>
            <p style="margin:8px 0 0;color:#4b5563;font-size:12px;line-height:1.45;">
              ${stall.description || "No description provided."}
            </p>
          </div>

          ${stallMenuHtml}

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

      marker.bindPopup(popupHtml, {
        className: "foodspotter-popup",
        closeButton: true,
      });
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
    Boolean(currentUser?.email) &&
    selectedStall.ownerEmail.toLowerCase() ===
      currentUser.email.toLowerCase() &&
    (currentUser?.role === "VENDOR" ||
      currentUser?.role === "OWNER" ||
      currentUser?.role === "ADMIN" ||
      currentUser?.role === "SUPER_ADMIN");

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
      menuText:
        formatMenuEditorText(selectedStall.menuJson) ||
        selectedStallMenu
          .map((item) =>
            [
              item.name || "",
              item.price ?? "",
              item.description || "",
              item.imageUrl || "",
            ]
              .map((part) => String(part).trim())
              .join(" | ")
              .replace(/\s+\|\s+\|/g, " | ")
              .replace(/\|\s*$/g, "")
              .trim(),
          )
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
          prev.map((stall) =>
            stall.id === response.data.id ? response.data : stall,
          ),
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

    if (!name || !description || !cuisine || !form.imageUrl.trim()) {
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
        imageUrl: form.imageUrl.trim(),
      };

      const response = await createStall(token, payload);

      if (response && response.success && response.data) {
        setShowVendorForm(true);

        setStalls((prev) => [...prev, response.data]);
        setForm({ name: "", description: "", cuisine: "", imageUrl: "" });
        clearSelectedLocation();
        setFormSuccess(
          "Business registration submitted. Your stall is pending admin review and your account will stay unchanged until manually promoted.",
        );
      }
    } catch (error) {
      console.error("Failed to create stall:", error);
      const errData = error.response?.data?.error;
      setFormError(
        normalizeErrorMessage(errData?.details || errData?.message),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout fullScreen={true}>
      <div className="relative w-full h-full flex bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,133,77,0.12),transparent_28%)]" />
        {/* Map - Full screen */}
        <div className="flex-1 relative">
          <div
            ref={mapContainerRef}
            className="w-full h-full rounded-none overflow-hidden brightness-[0.98] saturate-[1.04]"
          />
          <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-2xl border border-white/20 bg-slate-950/70 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
              Live dashboard
            </p>
            <h2 className="mt-1 text-sm font-semibold">
              Food spots on the map
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              Tap the map to place a stall, inspect submissions, and edit your
              own listings.
            </p>
          </div>
          {mapLoadError && (
            <div className="absolute bottom-4 left-4 max-w-xs rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs text-amber-700 shadow-lg backdrop-blur">
              {mapLoadError}
            </div>
          )}
          {selectedLocation && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-white/60 bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-lg backdrop-blur">
              <span>
                Selected: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
              </span>
              <button
                type="button"
                onClick={clearSelectedLocation}
                className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-100"
              >
                Clear pin
              </button>
            </div>
          )}
        </div>

        {/* Right-side panels */}
        <div className="fixed left-4 right-4 md:left-auto md:right-4 md:w-[24rem] top-20 bottom-4 z-1200 flex flex-col gap-3 pointer-events-none">
          {selectedStall && (
            <div className="pointer-events-auto overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <div className="relative">
                <img
                  src={getStallImage(selectedStall)}
                  alt={selectedStall.name || "Stall"}
                  loading="lazy"
                  className="h-44 w-full object-cover"
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
                  className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md hover:bg-white"
                >
                  Close
                </button>
              </div>

              <div className="max-h-[38vh] overflow-y-auto p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedStall.name}
                  </h3>
                  <span className="rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                    {getStallVisual(selectedStall.cuisine).label}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  {selectedStall.description || "No description provided."}
                </p>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/90 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Cuisine / Category
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedStall.cuisine || "General"}
                  </p>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Complete Menu
                  </p>
                  <div className="mt-2 space-y-2">
                    {selectedStallMenu.length === 0 ? (
                      <p className="rounded-2xl border border-slate-100 bg-white px-3 py-3 text-xs text-slate-500 shadow-sm">
                        No menu items were provided for this stall.
                      </p>
                    ) : (
                      selectedStallMenu.map((item, idx) => (
                        <div
                          key={`${item.name}-${idx}`}
                          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                        >
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
                          <div className="px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs font-bold text-orange-600">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                            {item.description && (
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {canEditSelectedStall && (
                  <div className="mt-4 rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-4 shadow-inner">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-orange-900">
                          Edit your stall
                        </p>
                        <p className="text-[11px] text-orange-700/80">
                          Only the creator of this stall can change these
                          details.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700 shadow-sm">
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

                    <form
                      onSubmit={handleSaveStallCustomization}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-orange-900/80">
                          Stall picture URL
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={stallEditForm.imageUrl}
                          onChange={handleStallEditChange}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-orange-900/80">
                          Menu items
                        </label>
                        <textarea
                          name="menuText"
                          rows={5}
                          value={stallEditForm.menuText}
                          onChange={handleStallEditChange}
                          placeholder="Name | Price | Description | Image URL (optional)\nExample: Silog Special | 95 | With egg and rice | https://..."
                          className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <p className="text-[11px] text-orange-700/70">
                          One item per line. Separate fields using{" "}
                          <span className="font-semibold">|</span>.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={stallSaving}
                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="pointer-events-auto overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 bg-gradient-to-r from-white to-slate-50/60">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {showVendorForm ? "Vendor Onboarding" : "Vendor Setup"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isVendorPanelCollapsed
                    ? "Tap the arrow to expand"
                    : "Provide stall details to register your business"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsVendorPanelCollapsed((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                aria-label={
                  isVendorPanelCollapsed ? "Expand panel" : "Collapse panel"
                }
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
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Become a Vendor
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        You are currently a regular user. Choose an action to
                        start your vendor onboarding.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowVendorForm(true)}
                      className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-0.5"
                    >
                      Add Your Stall
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowVendorForm(true)}
                      className="w-full rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-700 shadow-sm hover:bg-orange-100"
                    >
                      Register Your Business
                    </button>

                    <p className="text-xs leading-5 text-slate-400">
                      After submitting stall details, your role will
                      stay unchanged until an admin reviews and promotes it.
                    </p>
                  </div>
                )}

                {showVendorForm && (
                  <div>
                    <p className="mb-3 text-xs leading-5 text-slate-500">
                      Provide your stall name, location, and stall type to
                      register your business.
                    </p>
                    <form onSubmit={handleCreateStall} className="space-y-3">
                      {formSuccess && (
                        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 shadow-sm">
                          {formSuccess}
                        </div>
                      )}

                      {formError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-sm">
                          {formError}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-500">
                          Stall name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleFormChange}
                          minLength={3}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          placeholder="e.g. Juan's Tapsilog"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-500">
                          Cuisine
                        </label>
                        <select
                          name="cuisine"
                          value={form.cuisine}
                          onChange={handleFormChange}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
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
                        <label className="block text-xs font-medium text-slate-500">
                          Description
                        </label>
                        <textarea
                          name="description"
                          rows={2}
                          value={form.description}
                          onChange={handleFormChange}
                          minLength={10}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          placeholder="Short description of the stall"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-500">
                          Stall image URL
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={form.imageUrl}
                          onChange={handleFormChange}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          placeholder="https://.../stall.jpg"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting
                          ? "Submitting..."
                          : "Submit stall (uses selected pin)"}
                      </button>
                      <p className="text-[11px] text-gray-400">
                        Tip: Click on the map to choose the exact location
                        first, then add an image URL that ends in .jpg, .jpeg,
                        or .png.
                      </p>
                    </form>

                    <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      Current role: {currentUser?.role || "USER"}
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
