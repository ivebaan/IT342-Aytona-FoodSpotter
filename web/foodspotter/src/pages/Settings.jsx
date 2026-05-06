import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";

const SETTINGS_KEY = "settings";

const defaultSettings = {
  mapTile: "osm",
  showVendorTips: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      if (s) setSettings({ ...defaultSettings, ...s });
    } catch (e) {
      setSettings(defaultSettings);
    }
  }, []);

  const save = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    alert("Settings saved");
  };

  const clearFavorites = () => {
    localStorage.removeItem("favorites");
    alert("Favorites cleared");
  };

  return (
    <AppLayout title="Settings" subtitle="Application preferences">
      <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Map</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input type="radio" name="mapTile" checked={settings.mapTile === "osm"} onChange={() => setSettings((s) => ({ ...s, mapTile: "osm" }))} />
            <span className="text-sm">OpenStreetMap (default)</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="radio" name="mapTile" checked={settings.mapTile === "carto"} onChange={() => setSettings((s) => ({ ...s, mapTile: "carto" }))} />
            <span className="text-sm">Carto Light</span>
          </label>
        </div>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Preferences</h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={settings.showVendorTips} onChange={(e) => setSettings((s) => ({ ...s, showVendorTips: e.target.checked }))} />
          <span className="text-sm">Show vendor tips and onboarding messages</span>
        </label>

        <div className="flex gap-3">
          <button onClick={save} className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white">Save</button>
          <button onClick={clearFavorites} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">Clear Favorites</button>
        </div>
      </div>
    </AppLayout>
  );
}
