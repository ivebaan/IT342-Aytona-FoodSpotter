package com.aytona.foodspotter.ui

import android.graphics.Color

data class CuisineVisual(
    val emoji: String,
    val colorHex: String,
)

object CuisineOptions {
    val values = listOf(
        "Karinderya",
        "Carinderia",
        "Pungko-Pungko",
        "Turo-Turo",
        "Silogan",
        "Lugawan",
        "Paresan",
        "Ihawan",
        "Inasal House",
        "Lechon House",
        "Seafood Dampa",
        "Eatery",
        "Canteen",
        "Food Court Stall",
        "Street Food Stall",
        "Night Market Stall",
        "Cafe",
        "Coffee Shop",
        "Milk Tea Shop",
        "Bakery",
        "Dessert Shop",
        "Fast Food",
        "Food Truck",
        "Shawarma Stand",
        "Siomai Stall",
        "Takoyaki Stall",
        "Ramen Bar",
        "Korean Corn Dog Shop",
        "Aesthetic Cafe",
    )

    fun visualFor(cuisine: String?): CuisineVisual {
        val key = cuisine?.trim()?.lowercase().orEmpty()
        return when {
            key.contains("coffee") || key.contains("cafe") -> CuisineVisual("☕", "#8D6E63")
            key.contains("bakery") || key.contains("dessert") -> CuisineVisual("🧁", "#EC4899")
            key.contains("milk tea") -> CuisineVisual("🧋", "#14B8A6")
            key.contains("noodle") || key.contains("ramen") -> CuisineVisual("🍜", "#F97316")
            key.contains("shawarma") || key.contains("street") -> CuisineVisual("🌯", "#F59E0B")
            key.contains("seafood") -> CuisineVisual("🦐", "#0EA5E9")
            key.contains("fast food") || key.contains("food truck") -> CuisineVisual("🍔", "#EF4444")
            key.contains("corn dog") || key.contains("takoyaki") -> CuisineVisual("🍢", "#A855F7")
            key.contains("korean") -> CuisineVisual("🇰🇷", "#3B82F6")
            key.contains("carinderia") || key.contains("karinderya") || key.contains("eatery") -> CuisineVisual("🍛", "#F97316")
            else -> CuisineVisual("🍱", "#10B981")
        }
    }

    fun parseColor(hex: String): Int = Color.parseColor(hex)
}
