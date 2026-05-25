import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVendorStalls, updateStall } from "../features/stalls/api/stalls";
import { getStallVisual, formatCurrency } from "../features/stalls/utils/stallPresentation";
import { CUISINE_OPTIONS } from "../constants/cuisineOptions";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function VendorStalls() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Redirect if not vendor
  useEffect(() => {
    if (
      currentUser?.role !== "VENDOR" &&
      currentUser?.role !== "OWNER" &&
      currentUser?.role !== "ADMIN" &&
      currentUser?.role !== "SUPER_ADMIN"
    ) {
      navigate("/dashboard");
    }
  }, [currentUser?.role, navigate]);

  const [vendorStalls, setVendorStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [editForm, setEditForm] = useState({
    stallName: "",
    description: "",
    cuisine: "",
    imageUrl: "",
    menuItems: [],
  });
  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    price: "",
    description: "",
    itemImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadState, setLoadState] = useState("Loading your stalls...");

  // Fetch vendor's stalls
  useEffect(() => {
    const fetchVendorStalls = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await getVendorStalls(token);
        if (response && response.success && Array.isArray(response.data)) {
          setVendorStalls(response.data);
          setLoadState(`Loaded ${response.data.length} stall${response.data.length === 1 ? "" : "s"}.`);
        } else {
          setLoadState("No stalls returned from the server.");
        }
      } catch (err) {
        console.error("Failed to load vendor stalls:", err);
        setError("Failed to load your stalls. Please try again.");
        setLoadState("Failed to load stalls.");
      }
    };

    if (currentUser?.email) {
      fetchVendorStalls();
    }
  }, [currentUser?.email]);


  const handleSelectStall = (stall) => {
    setSelectedStall(stall);
    setError("");
    setSuccess("");

    // Parse menu from menuJson or menu string
    let parsedMenu = [];
    if (stall.menuJson) {
      try {
        if (typeof stall.menuJson === "string") {
          parsedMenu = JSON.parse(stall.menuJson);
        } else {
          parsedMenu = Array.isArray(stall.menuJson) ? stall.menuJson : [];
        }
      } catch (e) {
        parsedMenu = [];
      }
    }

    setEditForm({
      stallName: stall.name || "",
      description: stall.description || "",
      cuisine: stall.cuisine || "",
      imageUrl: stall.imageUrl || "",
      menuItems: Array.isArray(parsedMenu) ? parsedMenu : [],
    });
    setMenuItemForm({ name: "", price: "", description: "", itemImage: "" });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMenuItemFormChange = (e) => {
    const { name, value } = e.target;
    setMenuItemForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMenuItem = () => {
    if (!menuItemForm.name.trim() || !menuItemForm.price.trim()) {
      setError("Menu item name and price are required.");
      return;
    }

    const price = parseFloat(menuItemForm.price);
    if (isNaN(price) || price < 0) {
      setError("Price must be a valid positive number.");
      return;
    }

    const newItem = {
      name: menuItemForm.name.trim(),
      price: price,
      description: menuItemForm.description.trim() || "",
      itemImage: menuItemForm.itemImage.trim() || "",
    };

    setEditForm((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, newItem],
    }));

    setMenuItemForm({ name: "", price: "", description: "", itemImage: "" });
    setError("");
  };

  const handleRemoveMenuItem = (index) => {
    setEditForm((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index),
    }));
  };

  const handleSaveStall = async () => {
    if (!selectedStall) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in.");
        return;
      }

      const payload = {
        stallName: editForm.stallName.trim(),
        description: editForm.description.trim(),
        cuisine: editForm.cuisine,
        imageUrl: editForm.imageUrl.trim() || "",
        menuJson: JSON.stringify(editForm.menuItems),
      };

      const response = await updateStall(token, selectedStall.id, payload);

      if (response && response.success) {
        setSuccess("Stall updated successfully!");
        // Update the stall in the list
        setVendorStalls((prev) =>
          prev.map((s) =>
            s.id === selectedStall.id ? { ...s, ...response.data } : s
          )
        );
        setSelectedStall(response.data);
      }
    } catch (err) {
      console.error("Failed to save stall:", err);
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.error?.details ||
        "Failed to update stall. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const visual = selectedStall
    ? getStallVisual(selectedStall.cuisine)
    : { emoji: "🍜", color: "#8b5cf6", label: "Food Stall" };

  return (
    <AppLayout title="Manage Your Stalls" subtitle="Edit stall details and menu.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stall List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700">Your Stalls</h3>
            <p className="text-xs text-gray-400 mt-1">
              {vendorStalls.length === 0
                ? "No stalls yet."
                : `You have ${vendorStalls.length} stall${vendorStalls.length !== 1 ? "s" : ""}.`}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{loadState}</p>
          </div>

          <div className="space-y-2">
            {vendorStalls.map((stall) => (
              <button
                key={stall.id}
                onClick={() => handleSelectStall(stall)}
                className={`w-full text-left rounded-2xl border p-3 transition-all ${
                  selectedStall?.id === stall.id
                    ? "border-orange-300 bg-orange-50 shadow-md"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{visual.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {stall.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stall.cuisine || "General"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
                      stall.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : stall.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {stall.status || "PENDING"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stall Editor */}
        <div className="lg:col-span-2">
          {selectedStall ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-base font-bold text-gray-800">
                  {selectedStall.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Edit your stall details and menu.
                </p>
              </div>

              {/* Messages */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* Stall Details Form */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Stall Information
                </h4>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500">
                    Stall Name
                  </label>
                  <input
                    type="text"
                    name="stallName"
                    value={editForm.stallName}
                    onChange={handleEditFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g. Juan's Tapsilog"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500">
                    Cuisine Type
                  </label>
                  <select
                    name="cuisine"
                    value={editForm.cuisine}
                    onChange={handleEditFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select cuisine</option>
                    {CUISINE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
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
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe your stall..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500">
                    Stall Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={editForm.imageUrl}
                    onChange={handleEditFormChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://..."
                  />
                  {editForm.imageUrl && (
                    <img
                      src={editForm.imageUrl}
                      alt="Stall preview"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27150%27%3E%3Crect fill=%27%23f3f4f6%27 width=%27200%27 height=%27150%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-size=%2714%27 fill=%27%23999%27 text-anchor=%27middle%27 dy=%27.3em%27%3EImage not found%3C/text%3E%3C/svg%3E";
                      }}
                      className="mt-2 h-32 w-full rounded-lg border border-gray-200 object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Menu Management */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Menu Items
                </h4>

                {/* Menu Items List */}
                {editForm.menuItems.length > 0 && (
                  <div className="space-y-2">
                    {editForm.menuItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-orange-600 font-bold">
                            {formatCurrency(item.price)}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMenuItem(idx)}
                          className="flex-shrink-0 text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {editForm.menuItems.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    No menu items yet. Add one below.
                  </p>
                )}

                {/* Add Menu Item Form */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h5 className="text-xs font-semibold text-gray-600 uppercase">
                    Add Menu Item
                  </h5>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={menuItemForm.name}
                      onChange={handleMenuItemFormChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g. Pork Adobo Meal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-500">
                        Price (PHP) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={menuItemForm.price}
                        onChange={handleMenuItemFormChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-500">
                        Item Image URL
                      </label>
                      <input
                        type="url"
                        name="itemImage"
                        value={menuItemForm.itemImage}
                        onChange={handleMenuItemFormChange}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={menuItemForm.description}
                      onChange={handleMenuItemFormChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g. Served with steamed rice"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMenuItem}
                    className="w-full rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveStall}
                disabled={loading}
                className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <p className="text-sm text-gray-500">
                Select a stall from the list to edit its details and menu.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
