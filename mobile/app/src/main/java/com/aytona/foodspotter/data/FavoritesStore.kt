package com.aytona.foodspotter.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class FavoritesStore(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    fun getFavorites(): MutableList<StallDto> {
        val raw = prefs.getString(KEY_FAVORITES, "[]") ?: "[]"
        val type = object : TypeToken<MutableList<StallDto>>() {}.type
        return runCatching { gson.fromJson<MutableList<StallDto>>(raw, type) }.getOrDefault(mutableListOf())
    }

    fun saveFavorites(favorites: List<StallDto>) {
        prefs.edit().putString(KEY_FAVORITES, gson.toJson(favorites)).apply()
    }

    fun isFavorite(stallId: Long?): Boolean {
        if (stallId == null) return false
        return getFavorites().any { it.id == stallId }
    }

    fun toggle(stall: StallDto) {
        val favorites = getFavorites()
        val existingIndex = favorites.indexOfFirst { it.id == stall.id }
        if (existingIndex >= 0) {
            favorites.removeAt(existingIndex)
        } else {
            favorites.add(stall)
        }
        saveFavorites(favorites)
    }

    fun remove(stallId: Long?) {
        if (stallId == null) return
        saveFavorites(getFavorites().filterNot { it.id == stallId })
    }

    fun clear() {
        prefs.edit().remove(KEY_FAVORITES).apply()
    }

    companion object {
        private const val PREFS_NAME = "foodspotter_favorites"
        private const val KEY_FAVORITES = "favorites"
    }
}
