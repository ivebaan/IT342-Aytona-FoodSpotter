package com.aytona.foodspotter.ui

import android.content.Context
import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import coil.load
import com.aytona.foodspotter.data.StallDto
import com.aytona.foodspotter.databinding.ItemStallCardBinding

object StallCardFactory {
    fun create(
        context: Context,
        parent: ViewGroup,
        stall: StallDto,
        isFavorite: Boolean,
        onOpen: () -> Unit,
        onFavoriteToggle: (() -> Unit)? = null,
    ): View {
        val binding = ItemStallCardBinding.inflate(LayoutInflater.from(context), parent, false)
        val visual = CuisineOptions.visualFor(stall.cuisine)
        val accent = CuisineOptions.parseColor(visual.colorHex)
        val imageUrl = stall.imageUrl?.trim().orEmpty()

        binding.stallImage.visibility = if (imageUrl.isBlank()) View.GONE else View.VISIBLE
        if (imageUrl.isNotBlank()) {
            binding.stallImage.load(imageUrl) {
                crossfade(true)
            }
        }

        binding.stallAccent.text = visual.emoji
        binding.stallAccent.backgroundTintList = ColorStateList.valueOf(accent)
        binding.stallName.text = stall.name?.takeIf { it.isNotBlank() } ?: "Untitled stall"
        binding.stallCuisine.text = stall.cuisine?.takeIf { it.isNotBlank() } ?: "Cuisine not set"
        binding.stallDescription.text = stall.description?.takeIf { it.isNotBlank() } ?: "No description provided yet."
        binding.stallStatus.text = stall.status?.replace('_', ' ')?.lowercase()?.replaceFirstChar { it.uppercase() } ?: "Pending"
        binding.stallMeta.text = buildString {
            append("Lat ")
            append(stall.latitude?.let { String.format("%.4f", it) } ?: "--")
            append(" • Lng ")
            append(stall.longitude?.let { String.format("%.4f", it) } ?: "--")
        }
        binding.stallFavoriteButton.text = if (isFavorite) "Saved" else "Save"
        binding.stallFavoriteButton.isEnabled = onFavoriteToggle != null
        binding.stallFavoriteButton.alpha = if (onFavoriteToggle != null) 1f else 0.4f
        binding.stallFavoriteButton.setOnClickListener { onFavoriteToggle?.invoke() }
        binding.stallOpenButton.setOnClickListener { onOpen() }
        return binding.root
    }
}
