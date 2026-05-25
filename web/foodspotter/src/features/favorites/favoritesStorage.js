const LEGACY_FAVORITES_KEY = "favorites";

export function getFavoritesStorageKey(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return normalizedEmail ? `favorites:${normalizedEmail}` : "favorites:anonymous";
}

export function readFavorites(email) {
  if (!email) return [];

  try {
    return JSON.parse(localStorage.getItem(getFavoritesStorageKey(email)) || "[]");
  } catch {
    return [];
  }
}

export function writeFavorites(email, favorites) {
  if (!email) return;
  localStorage.setItem(getFavoritesStorageKey(email), JSON.stringify(favorites || []));
}

export function removeFavorite(email, id) {
  const favorites = readFavorites(email).filter((favorite) => favorite.id !== id);
  writeFavorites(email, favorites);
  return favorites;
}

export function addFavorite(email, stall) {
  const favorites = readFavorites(email);
  if (!favorites.some((favorite) => favorite.id === stall.id)) {
    favorites.push(stall);
    writeFavorites(email, favorites);
  }
  return favorites;
}

export function clearFavoritesForUser(email) {
  if (email) {
    localStorage.removeItem(getFavoritesStorageKey(email));
  }
  localStorage.removeItem(LEGACY_FAVORITES_KEY);
}
