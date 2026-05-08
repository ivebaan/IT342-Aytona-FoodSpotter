import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";

const SETTINGS_KEY = "settings";

const defaultSettings = {
  mapTile: "osm",
  showVendorTips: true,
  itemsPerPage: 12,
  defaultMapZoom: 13,
  enableNotifications: true,
  showLocation: true,
  theme: "light",
  autoSavePreferences: true,
  showSearchHistory: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saveMessage, setSaveMessage] = useState("");

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
    setSaveMessage("✓ Settings saved successfully");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      setSettings(defaultSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      setSaveMessage("✓ Settings reset to defaults");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const clearFavorites = () => {
    if (
      confirm(
        "Are you sure you want to clear all favorites? This cannot be undone.",
      )
    ) {
      localStorage.removeItem("favorites");
      setSaveMessage("✓ Favorites cleared");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const clearSearchHistory = () => {
    if (confirm("Are you sure you want to clear search history?")) {
      localStorage.removeItem("searchHistory");
      setSaveMessage("✓ Search history cleared");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <AppLayout
      title="Settings"
      subtitle="Customize your FoodSpotter experience"
    >
      <div className="max-w-2xl space-y-6">
        {/* Save Message */}
        {saveMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
            {saveMessage}
          </div>
        )}

        {/* Map Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            🗺️ Map
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Tile Provider
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="mapTile"
                    checked={settings.mapTile === "osm"}
                    onChange={() =>
                      setSettings((s) => ({ ...s, mapTile: "osm" }))
                    }
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    OpenStreetMap (default)
                  </span>
                </label>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="mapTile"
                    checked={settings.mapTile === "carto"}
                    onChange={() =>
                      setSettings((s) => ({ ...s, mapTile: "carto" }))
                    }
                    className="w-4 h-4 text-orange-500"
                  />
                  <span className="text-sm text-gray-700">Carto Light</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Map Zoom Level: {settings.defaultMapZoom}
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={settings.defaultMapZoom}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    defaultMapZoom: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower = more zoomed out, Higher = more zoomed in
              </p>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            👁️ Display
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items Per Page
              </label>
              <select
                value={settings.itemsPerPage}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    itemsPerPage: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="6">6 items</option>
                <option value="12">12 items</option>
                <option value="24">24 items</option>
                <option value="36">36 items</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, theme: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            ⚙️ Preferences
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showVendorTips}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    showVendorTips: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                Show vendor tips and onboarding messages
              </span>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    enableNotifications: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                Enable notifications
              </span>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLocation}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, showLocation: e.target.checked }))
                }
                className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                Show my location on map
              </span>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSavePreferences}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    autoSavePreferences: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                Auto-save preferences
              </span>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showSearchHistory}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    showSearchHistory: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Show search history</span>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            🗑️ Data Management
          </h2>
          <p className="text-xs text-gray-500">
            Manage your app data and preferences
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={clearSearchHistory}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              Clear Search History
            </button>
            <button
              onClick={clearFavorites}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              Clear Favorites
            </button>
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              Reset All Settings to Defaults
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={save}
            className="flex-1 rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            💾 Save Settings
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">💡 Tip:</span> Your settings are
            saved locally in your browser. They will persist across sessions.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
