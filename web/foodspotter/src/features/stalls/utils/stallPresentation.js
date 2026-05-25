const VISUAL_RULES = [
  // 🍛 Local Eatery / Karinderya
  {
    category: "karinderya",
    keywords: [
      "karinderya",
      "carinderia",
      "eatery",
      "canteen",
      "food stall",
      "food court stall",
      "street food stall",
      "night market stall",
      "market stall",
      "kiosk",
      "sari-sari store",
      "turo",
      "turo-turo",
      "silogan",
      "lugawan",
      "pares",
      "paresan",
      "sisig",
      "sisigan",
      "bulalohan",
      "bulalo",
      "gotohan",
      "mami house",
      "panciteria",
      "palabokan",
      "tuslob",
      "tuslob buwa",
      "tuslob buwa-an",
      "rice meal stall",
      "rice toppings stall",
      "rice bowl stall",
      "snack stall",
    ],
    emoji: "🍛",
    color: "#f97316",
    label: "Local Eatery",
  },

  // ☕ Cafe / Drinks / Chill
  {
    category: "cafe",
    keywords: [
      "cafe",
      "coffee shop",
      "coffee stand",
      "coffee",
      "milk tea shop",
      "milk tea stand",
      "milk tea",
      "matcha",
      "tea house",
      "co-working cafe",
      "co working cafe",
      "aesthetic cafe",
      "minimalist cafe",
      "plant cafe",
      "pet cafe",
      "book cafe",
      "gaming cafe",
      "internet cafe",
      "art cafe",
      "smoothie bar",
      "juice bar",
      "shake stand",
    ],
    emoji: "☕",
    color: "#0ea5e9",
    label: "Cafe",
  },

  // 🍔 Fast Food / Quick Service
  {
    category: "fastfood",
    keywords: [
      "fast food",
      "fastfood",
      "burger",
      "burger stall",
      "burger joint",
      "fries",
      "hotdog",
      "hotdog stand",
      "shawarma",
      "shawarma stand",
      "sandwich stall",
      "pizza stall",
      "chicken stall",
      "fried chicken",
      "drive-thru",
      "takeout counter",
    ],
    emoji: "🍔",
    color: "#ef4444",
    label: "Fast Food",
  },

  // 🍰 Desserts / Bakery
  {
    category: "dessert",
    keywords: [
      "dessert",
      "dessert shop",
      "dessert stall",
      "pastry",
      "bakery",
      "pastry shop",
      "halo-halo",
      "halo",
      "ice cream",
      "ice cream stall",
      "cheesecake",
      "souffle",
      "croffle",
      "ube",
      "cake",
      "cookie",
      "donut",
      "sweet",
      "dessert cafe",
      "dessert buffet cafe",
    ],
    emoji: "🍰",
    color: "#ec4899",
    label: "Dessert Shop",
  },

  // 🔥 Grill / BBQ / Inihaw
  {
    category: "grill",
    keywords: [
      "ihawan",
      "inasal",
      "inasal house",
      "isaw",
      "samgyup",
      "samgyupsal",
      "grill",
      "grill house",
      "bbq",
      "barbecue",
      "bbq stall",
      "grilled food stall",
      "street bbq stall",
      "skewer stall",
      "wings",
      "chicken wings",
      "chicken stall",
      "sisig",
    ],
    emoji: "🔥",
    color: "#f59e0b",
    label: "Grill House",
  },

  // 🦐 Seafood / Dampa / Boil
  {
    category: "seafood",
    keywords: [
      "seafood",
      "seafood house",
      "seafood stall",
      "dampa",
      "boil",
      "seafood boil",
      "crab",
      "shrimp",
      "hipon",
      "isda",
    ],
    emoji: "🦐",
    color: "#06b6d4",
    label: "Seafood",
  },

  // 🌮 Street Food (NEW - important layer)
  {
    category: "streetfood",
    keywords: [
      "street food",
      "street stall",
      "street food stall",
      "night market",
      "night market stall",
      "pungko",
      "pungko-pungko",
      "fishball",
      "fish ball",
      "kwek kwek",
      "tempura",
      "balut",
      "penoy",
      "betamax",
      "adidas",
      "helmet",
      "walkman",
      "isaw",
      "banana cue",
      "kamote cue",
      "turon",
      "maruya",
      "dirty ice cream",
      "ice scramble",
      "mais",
      "buko juice",
      "sugarcane juice",
      "palamig",
      "hotdog stand",
      "burger stand",
      "fries stand",
      "siomai",
      "siopao",
      "takoyaki",
      "skewer stall",
      "food cart",
      "mobile food cart",
    ],
    emoji: "🍡",
    color: "#f97316",
    label: "Street Food",
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
      // Ignore malformed menu JSON and treat it as empty.
    }
  }

  return [];
}

export function formatCurrency(value) {
  if (!Number.isFinite(Number(value))) return "Market price";
  return `PHP ${Number(value).toFixed(2)}`;
}
