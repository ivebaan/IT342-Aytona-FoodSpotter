package com.aytona.foodspotter.ui

import android.graphics.Color

data class CuisineVisual(
    val emoji: String,
    val colorHex: String,
)

object CuisineOptions {
    val values = listOf(
        "Karinderya",
        "Pungko-Pungko",
        "Turo-Turo",
        "Silogan",
        "Lugawan",
        "Paresan",
        "Sisigan",
        "Bulalohan",
        "Gotohan",
        "Mami House",
        "Panciteria",
        "Palabokan",
        "Tuslob Buwa-an",
        "Ihawan",
        "Inasal House",
        "Lechon House",
        "Seafood House",
        "Grill House",
        "Eatery",
        "Canteen",
        "Food Stall",
        "Food Court Stall",
        "Street Food Stall",
        "Night Market Stall",
        "Market Stall",
        "Sari-Sari Store (with food)",
        "Cafe",
        "Coffee Shop",
        "Milk Tea Shop",
        "Tea House",
        "Bakery",
        "Pastry Shop",
        "Dessert Shop",
        "Juice Bar",
        "Smoothie Bar",
        "Fast Food Restaurant",
        "Casual Dining Restaurant",
        "Fine Dining Restaurant",
        "Buffet Restaurant",
        "Family Restaurant",
        "Theme Restaurant",
        "Food Truck",
        "Pop-up Kitchen",
        "Cloud Kitchen / Ghost Kitchen",
        "Takeout Counter",
        "Drive-Thru",
        "Deli",
        "Bistro",
        "Bar",
        "Restobar",
        "KTV Bar",
        "Sports Bar",
        "Beer Garden",
        "BBQ Stall",
        "Grilled Food Stall",
        "Fried Food Stall",
        "Rice Meal Stall",
        "Rice Toppings Stall",
        "Rice Bowl Stall",
        "Noodle Stall",
        "Soup Stall",
        "Snack Stall",
        "Dessert Stall",
        "Seafood Stall",
        "Chicken Stall",
        "Burger Stall",
        "Hotdog Stall",
        "Sandwich Stall",
        "Pizza Stall",
        "Street BBQ Stall",
        "Skewer Stall",
        "Kiosk",
        "Snack Cart",
        "Mobile Food Cart",
        "Drink Stand",
        "Coffee Stand",
        "Juice Stand",
        "Shake Stand",
        "Milk Tea Stand",
        "Ice Cream Stall",
        "Samgyupsal Restaurant",
        "Ramen Bar",
        "Sushi Bar",
        "Tempura House",
        "Takoyaki Shop",
        "Dim Sum House",
        "Hotpot Restaurant",
        "Shabu-Shabu Restaurant",
        "Burger Joint",
        "Steakhouse",
        "Wing House",
        "Seafood Boil Restaurant",
        "Pasta House",
        "Pizza Parlor",
        "Chicken House",
        "All-Day Breakfast Restaurant",
        "Aesthetic Cafe",
        "Minimalist Cafe",
        "Plant Cafe",
        "Co-working Cafe",
        "Pet Cafe",
        "Dessert Cafe",
        "Book Cafe",
        "Gaming Cafe",
        "Internet Cafe",
        "Art Cafe",
        "Other",
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
