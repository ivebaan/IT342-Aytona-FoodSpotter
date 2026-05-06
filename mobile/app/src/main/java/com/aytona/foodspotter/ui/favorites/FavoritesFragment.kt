package com.aytona.foodspotter.ui.favorites

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.aytona.foodspotter.data.FavoritesStore
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.databinding.FragmentFavoritesBinding
import com.aytona.foodspotter.ui.MapUtils
import com.aytona.foodspotter.ui.StallCardFactory

class FavoritesFragment : Fragment() {
    private var _binding: FragmentFavoritesBinding? = null
    private val binding get() = _binding!!

    private lateinit var favoritesStore: FavoritesStore
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentFavoritesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        favoritesStore = FavoritesStore(requireContext())
        sessionManager = SessionManager(requireContext())
        MapUtils.initialize(requireContext())
        MapUtils.prepareMap(binding.favoritesMap)
        binding.favoritesClearButton.setOnClickListener {
            favoritesStore.clear()
            renderFavorites()
        }
        renderFavorites()
    }

    private fun renderFavorites() {
        val favorites = favoritesStore.getFavorites()
        binding.favoritesCount.text = favorites.size.toString()
        binding.favoritesContainer.removeAllViews()
        binding.favoritesEmptyState.visibility = if (favorites.isEmpty()) View.VISIBLE else View.GONE
        binding.favoritesMap.overlays.clear()
        favorites.forEach { stall ->
            binding.favoritesContainer.addView(
                StallCardFactory.create(
                    context = requireContext(),
                    parent = binding.favoritesContainer,
                    stall = stall,
                    isFavorite = true,
                    onOpen = {
                        if (stall.latitude != null && stall.longitude != null) {
                            MapUtils.centerOn(binding.favoritesMap, stall.latitude, stall.longitude)
                        }
                    },
                    onFavoriteToggle = {
                        favoritesStore.remove(stall.id)
                        renderFavorites()
                    },
                ),
            )
        }
        MapUtils.bindStallMarkers(binding.favoritesMap, favorites) { stall ->
            if (stall.latitude != null && stall.longitude != null) {
                MapUtils.centerOn(binding.favoritesMap, stall.latitude, stall.longitude)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        binding.favoritesMap.onResume()
    }

    override fun onPause() {
        binding.favoritesMap.onPause()
        super.onPause()
    }

    override fun onDestroyView() {
        binding.favoritesMap.onDetach()
        super.onDestroyView()
        _binding = null
    }
}
