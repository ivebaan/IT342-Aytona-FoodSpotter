import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AppLayout from "../components/AppLayout";
import { getStallVisual } from "../features/stalls/utils/stallPresentation";

const defaultIconHtml = (emoji = "🍜", color = "#f97316") =>
  `<div style="width:36px;height:36px;border-radius:9999px;background:${color};border:3px solid #be123c;box-shadow:0 8px 16px rgba(15,23,42,.18);display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;">${emoji}</div>`;

export default function Favorites() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [favorites, setFavorites] = useState([]);

  const FAVORITES_KEY = "favorites";

  const getFavorites = () => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch (e) {
      return [];
    }
  };

  const removeFavorite = (id) => {
    const arr = getFavorites().filter((f) => f.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));
    setFavorites(arr);
    // remove marker
    markersRef.current.forEach((m) => {
      if (m._stallId === id) {
        mapInstanceRef.current.removeLayer(m);
      }
    });
  };

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current).setView([10.3157, 123.8854], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      markersRef.current = [];
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.getPane("markerPane")) return;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    favorites.forEach((f) => {
      if (f.latitude == null || f.longitude == null) return;
      const lat = Number(f.latitude);
      const lng = Number(f.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const visual = getStallVisual(f.cuisine || f.type);
      const icon = L.divIcon({ className: "", html: defaultIconHtml(visual.emoji, visual.color), iconSize: [36, 36], iconAnchor: [18, 36] });
      const m = L.marker([lat, lng], { icon }).addTo(map);
      const popupHtml = `
        <div style="min-width:210px;max-width:250px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
          <div style="font-size:15px;font-weight:700;color:#111827;line-height:1.2;">${f.name}</div>
          <div style="margin-top:6px;display:inline-block;padding:4px 9px;border-radius:999px;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:11px;font-weight:600;">
            ${f.cuisine || "Cuisine N/A"}
          </div>
          <p style="margin:8px 0 0;color:#4b5563;font-size:12px;line-height:1.45;">
            ${f.description || "No description provided."}
          </p>
        </div>
      `;
      m.bindPopup(popupHtml, { className: "foodspotter-popup", closeButton: true });
      m._stallId = f.id;
      markersRef.current.push(m);
    });
  }, [favorites]);

  const centerOn = (f) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView([f.latitude, f.longitude], 16);
  };

  return (
    <AppLayout title="Favorites" subtitle="Your saved food spots.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Saved Favorites</h3>
            <p className="text-xs text-gray-400">Tap an item to center on map.</p>
          </div>

          <div className="space-y-3">
            {favorites.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm text-gray-500">No favorites yet.</div>
            )}

            {favorites.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-3 flex items-start justify-between">
                <div onClick={() => centerOn(f)} className="cursor-pointer">
                  <div className="text-sm font-semibold text-gray-800">{f.name}</div>
                  <div className="text-xs text-gray-400">{f.cuisine || "-"}</div>
                </div>
                <div>
                  <button onClick={() => removeFavorite(f.id)} className="text-xs text-red-600">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div ref={mapRef} className="w-full h-96 md:h-[600px]" />
        </div>
      </div>
    </AppLayout>
  );
}
