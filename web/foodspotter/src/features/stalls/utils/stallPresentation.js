const VISUAL_RULES = [
  {
    category: "karinderya",
    keywords: [
      "karinderya",
      "carinderia",
      "eatery",
      "canteen",
      "turo",
      "silogan",
      "lugawan",
      "pares",
    ],
    emoji: "🍛",
    color: "#f97316",
    label: "Local Eatery",
  },
  {
    category: "cafe",
    keywords: ["cafe", "coffee", "milk tea", "matcha", "co-working"],
    emoji: "☕",
    color: "#0ea5e9",
    label: "Cafe",
  },
  {
    category: "fastfood",
    keywords: ["fast food", "burger", "fries", "shawarma", "hotdog"],
    emoji: "🍔",
    color: "#ef4444",
    label: "Fast Food",
  },
  {
    category: "dessert",
    keywords: [
      "dessert",
      "pastry",
      "bakery",
      "halo",
      "ice cream",
      "cheesecake",
      "souffle",
      "croffle",
      "ube",
    ],
    emoji: "🍰",
    color: "#ec4899",
    label: "Dessert Shop",
  },
  {
    category: "grill",
    keywords: ["ihawan", "inasal", "isaw", "samgyup", "wings", "grill"],
    emoji: "🔥",
    color: "#f59e0b",
    label: "Grill House",
  },
  {
    category: "seafood",
    keywords: ["seafood", "dampa", "boil"],
    emoji: "🦐",
    color: "#06b6d4",
    label: "Seafood",
  },
];

export function getStallVisual(cuisine = "") {
  const normalized = String(cuisine || "").toLowerCase();
  const match = VISUAL_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return (
    match || {
      category: "general",
      emoji: "🍜",
      color: "#8b5cf6",
      label: "Food Stall",
    }
  );
}

export function getStallImage(stall) {
  const explicitUrl =
    stall?.imageUrl ||
    stall?.photoUrl ||
    stall?.image ||
    stall?.photo ||
    stall?.coverImageUrl ||
    "";

  if (explicitUrl) return explicitUrl;

  const visual = getStallVisual(stall?.cuisine || stall?.type);
  const title = stall?.name || "FoodSpotter Stall";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='480'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='${visual.color}' />
          <stop offset='100%' stop-color='#111827' />
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)' />
      <circle cx='690' cy='96' r='78' fill='rgba(255,255,255,.15)' />
      <text x='60' y='150' font-size='88' fill='white'>${visual.emoji}</text>
      <text x='60' y='230' font-family='Segoe UI, Arial, sans-serif' font-size='44' fill='white' font-weight='700'>${title}</text>
      <text x='60' y='290' font-family='Segoe UI, Arial, sans-serif' font-size='26' fill='rgba(255,255,255,.88)'>${visual.label}</text>
    </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function normalizeMenuItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item) => {
      if (typeof item === "string") {
        return { name: item, price: null, description: "" };
      }

      if (item && typeof item === "object") {
        return {
          name: item.name || item.itemName || "Menu Item",
          price: Number.isFinite(Number(item.price)) ? Number(item.price) : null,
          description: item.description || item.notes || "",
          imageUrl: item.imageUrl || item.photoUrl || item.image || "",
        };
      }

      return null;
    })
    .filter(Boolean);
}

const MENU_TEMPLATES = {
  karinderya: [
    { name: "Pork Adobo Meal", price: 89, description: "Served with steamed rice" },
    { name: "Chicken Tinola", price: 95, description: "Comforting ginger broth" },
    { name: "Ginataang Gulay", price: 75, description: "Coconut milk veggie stew" },
  ],
  cafe: [
    { name: "Cafe Latte", price: 120, description: "Double shot espresso" },
    { name: "Spanish Bread", price: 55, description: "Freshly baked" },
    { name: "Iced Matcha", price: 135, description: "Creamy and smooth" },
  ],
  fastfood: [
    { name: "Classic Burger", price: 99, description: "With fries" },
    { name: "Cheesy Hotdog Sandwich", price: 79, description: "House sauce" },
    { name: "Loaded Fries", price: 85, description: "Cheese and bacon bits" },
  ],
  dessert: [
    { name: "Halo-Halo Special", price: 120, description: "Ube ice cream topper" },
    { name: "Leche Flan Slice", price: 65, description: "Creamy caramel custard" },
    { name: "Croffle", price: 95, description: "Buttery and crisp" },
  ],
  grill: [
    { name: "Chicken Inasal", price: 110, description: "Char-grilled quarter" },
    { name: "Pork BBQ Skewers", price: 85, description: "Sweet-savory glaze" },
    { name: "Isaw Combo", price: 70, description: "With spiced vinegar" },
  ],
  seafood: [
    { name: "Garlic Butter Shrimp", price: 155, description: "Served with rice" },
    { name: "Grilled Squid", price: 165, description: "Calamansi-soy dip" },
    { name: "Seafood Boil Solo", price: 195, description: "Crab, shrimp, corn" },
  ],
  general: [
    { name: "House Rice Meal", price: 95, description: "Chef's daily special" },
    { name: "Signature Snack", price: 75, description: "Popular crowd favorite" },
    { name: "Refreshing Drink", price: 55, description: "Best paired with any meal" },
  ],
};

export function getStallMenu(stall) {
  const fromDirectArray = normalizeMenuItems(stall?.menu || stall?.menuItems);
  if (fromDirectArray.length > 0) return fromDirectArray;

  if (typeof stall?.menu === "string" && stall.menu.trim()) {
    const parsed = stall.menu
      .split(/\n|;/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ name: line, price: null, description: "" }));

    if (parsed.length > 0) return parsed;
  }

  if (typeof stall?.menuJson === "string") {
    try {
      const parsed = JSON.parse(stall.menuJson);
      const normalized = normalizeMenuItems(parsed);
      if (normalized.length > 0) return normalized;
    } catch {
      // Ignore malformed menu JSON and use fallback template.
    }
  }

  const category = getStallVisual(stall?.cuisine || stall?.type).category;
  return MENU_TEMPLATES[category] || MENU_TEMPLATES.general;
}

export function formatCurrency(value) {
  if (!Number.isFinite(Number(value))) return "Market price";
  return `PHP ${Number(value).toFixed(2)}`;
}
