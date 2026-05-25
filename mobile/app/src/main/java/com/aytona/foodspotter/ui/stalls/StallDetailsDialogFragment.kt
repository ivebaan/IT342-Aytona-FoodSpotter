package com.aytona.foodspotter.ui.stalls

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.DialogFragment
import androidx.core.content.ContextCompat
import coil.load
import com.aytona.foodspotter.R
import com.aytona.foodspotter.data.StallDto
import com.aytona.foodspotter.databinding.DialogStallDetailsBinding
import com.aytona.foodspotter.ui.CuisineOptions
import com.google.android.material.card.MaterialCardView
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonParser
import java.text.NumberFormat
import java.util.Locale

class StallDetailsDialogFragment : DialogFragment() {
    private var _binding: DialogStallDetailsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = DialogStallDetailsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val stall = requireArguments().getString(ARG_STALL_JSON)
            ?.let { Gson().fromJson(it, StallDto::class.java) }

        if (stall == null) {
            dismissAllowingStateLoss()
            return
        }

        val visual = CuisineOptions.visualFor(stall.cuisine)
        binding.stallDetailsCuisine.text = stall.cuisine?.takeIf { it.isNotBlank() } ?: "Cuisine not set"
        binding.stallDetailsName.text = stall.name?.takeIf { it.isNotBlank() } ?: "Untitled stall"
        binding.stallDetailsStatus.text = stall.status?.replace('_', ' ')?.lowercase()?.replaceFirstChar { it.uppercase() } ?: "Pending"
        binding.stallDetailsDescription.text = stall.description?.takeIf { it.isNotBlank() } ?: "No description provided."
        binding.stallDetailsOwner.text = stall.ownerEmail?.takeIf { it.isNotBlank() } ?: "Unknown"
        binding.stallDetailsAddress.text = stall.address?.takeIf { it.isNotBlank() } ?: "No address provided."
        binding.stallDetailsLocation.text = buildString {
            append(stall.latitude?.let { String.format(Locale.getDefault(), "%.5f", it) } ?: "--")
            append(", ")
            append(stall.longitude?.let { String.format(Locale.getDefault(), "%.5f", it) } ?: "--")
        }

        binding.stallDetailsAccent.text = visual.emoji
        binding.stallDetailsImage.isVisible = !stall.imageUrl.isNullOrBlank()
        if (!stall.imageUrl.isNullOrBlank()) {
            binding.stallDetailsImage.load(stall.imageUrl) {
                crossfade(true)
            }
        }

        val menuItems = parseMenuItems(stall.menuJson)
        binding.stallDetailsMenuTitle.text = "Menu (${menuItems.size})"
        binding.stallDetailsMenuEmpty.isVisible = menuItems.isEmpty()
        binding.stallDetailsMenuContainer.removeAllViews()

        menuItems.forEach { item ->
            binding.stallDetailsMenuContainer.addView(buildMenuItemView(item))
        }

        binding.stallDetailsCloseButton.setOnClickListener { dismissAllowingStateLoss() }
    }

    override fun onStart() {
        super.onStart()
        dialog?.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.92f).toInt(),
            WindowManager.LayoutParams.WRAP_CONTENT,
        )
    }

    private fun buildMenuItemView(item: MenuItemDto): View {
        val context = requireContext()
        val card = MaterialCardView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            )
            radius = dp(16).toFloat()
            cardElevation = 0f
            strokeWidth = dp(1)
            setCardBackgroundColor(ContextCompat.getColor(context, R.color.brand_white))
            strokeColor = ContextCompat.getColor(context, R.color.brand_orange_100)
        }

        val row = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            )
            setPadding(
                dp(12),
                dp(12),
                dp(12),
                dp(12),
            )
        }

        val image = ImageView(context).apply {
            layoutParams = LinearLayout.LayoutParams(
                dp(72),
                dp(72),
            ).apply {
                marginEnd = dp(12)
            }
            scaleType = ImageView.ScaleType.CENTER_CROP
            setBackgroundColor(ContextCompat.getColor(context, R.color.brand_orange_100))
            if (!item.imageUrl.isNullOrBlank()) {
                load(item.imageUrl) {
                    crossfade(true)
                }
            }
        }

        val column = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)
        }

        val name = TextView(context).apply {
            text = item.name.ifBlank { "Menu Item" }
            setTextColor(resources.getColor(R.color.brand_ink, null))
            textSize = 15f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }

        val price = TextView(context).apply {
            text = formatPrice(item.price)
            setTextColor(resources.getColor(R.color.brand_orange_600, null))
            textSize = 12f
            setTypeface(typeface, android.graphics.Typeface.BOLD)
        }

        val description = TextView(context).apply {
            text = item.description.ifBlank { "" }
            setTextColor(resources.getColor(R.color.brand_stone, null))
            textSize = 12f
            isVisible = item.description.isNotBlank()
        }

        column.addView(name)
        column.addView(price)
        column.addView(description)
        row.addView(image)
        row.addView(column)
        card.addView(row)
        return card
    }

    private fun parseMenuItems(menuJson: String?): List<MenuItemDto> {
        if (menuJson.isNullOrBlank()) return emptyList()

        return runCatching {
            val element = JsonParser.parseString(menuJson)
            val array: JsonArray = when {
                element.isJsonArray -> element.asJsonArray
                element.isJsonObject -> JsonArray().apply { add(element.asJsonObject) }
                else -> JsonArray()
            }

            array.mapNotNull { jsonElement -> jsonElement.toMenuItemOrNull() }
        }.getOrDefault(emptyList())
    }

    private fun JsonElement.toMenuItemOrNull(): MenuItemDto? {
        if (!isJsonObject) return null
        val obj = asJsonObject
        val name = obj.getAsStringOrEmpty("name")
        val description = obj.getAsStringOrEmpty("description")
        val imageUrl = obj.getAsStringOrEmpty("imageUrl")
        val price = obj.getAsDoubleOrNull("price")
        return if (name.isBlank() && description.isBlank() && imageUrl.isBlank() && price == null) null
        else MenuItemDto(name = name, description = description, imageUrl = imageUrl, price = price)
    }

    private fun com.google.gson.JsonObject.getAsStringOrEmpty(key: String): String {
        val value = get(key)
        return when {
            value == null || value.isJsonNull -> ""
            value.isJsonPrimitive -> value.asString.orEmpty()
            else -> value.toString().orEmpty()
        }
    }

    private fun com.google.gson.JsonObject.getAsDoubleOrNull(key: String): Double? {
        val value = get(key)
        return runCatching {
            when {
                value == null || value.isJsonNull -> null
                value.isJsonPrimitive && value.asJsonPrimitive.isNumber -> value.asDouble
                value.isJsonPrimitive -> value.asString.toDoubleOrNull()
                else -> null
            }
        }.getOrNull()
    }

    private fun formatPrice(price: Double?): String {
        if (price == null) return "Price not set"
        val formatted = NumberFormat.getCurrencyInstance(Locale("en", "PH")).format(price)
        return formatted
    }

    private fun dp(value: Int): Int {
        return (value * resources.displayMetrics.density).toInt()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    data class MenuItemDto(
        val name: String,
        val description: String,
        val imageUrl: String,
        val price: Double?,
    )

    companion object {
        private const val TAG = "StallDetailsDialog"
        private const val ARG_STALL_JSON = "arg_stall_json"

        fun show(manager: androidx.fragment.app.FragmentManager, stall: StallDto) {
            StallDetailsDialogFragment().apply {
                arguments = Bundle().apply {
                    putString(ARG_STALL_JSON, Gson().toJson(stall))
                }
            }.show(manager, TAG)
        }
    }
}