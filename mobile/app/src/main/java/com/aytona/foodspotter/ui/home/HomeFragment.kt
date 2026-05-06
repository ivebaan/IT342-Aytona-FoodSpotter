package com.aytona.foodspotter.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aytona.foodspotter.R
import com.aytona.foodspotter.data.ApiClient
import com.aytona.foodspotter.data.FavoritesStore
import com.aytona.foodspotter.data.FoodSpotterRepository
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.data.SettingsStore
import com.aytona.foodspotter.data.StallDto
import com.aytona.foodspotter.databinding.FragmentHomeBinding
import com.aytona.foodspotter.ui.MapUtils
import com.aytona.foodspotter.ui.StallCardFactory
import kotlinx.coroutines.launch

class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var favoritesStore: FavoritesStore
    private lateinit var settingsStore: SettingsStore
    private lateinit var repository: FoodSpotterRepository
    private var stalls: List<StallDto> = emptyList()
    private var selectedStall: StallDto? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        favoritesStore = FavoritesStore(requireContext())
        settingsStore = SettingsStore(requireContext())
        repository = FoodSpotterRepository(ApiClient.service, sessionManager)

        MapUtils.initialize(requireContext())
        MapUtils.prepareMap(binding.homeMap)

        binding.homeRefreshButton.setOnClickListener { loadStalls() }
        binding.homeGoToAuthButton.setOnClickListener { findNavController().navigate(R.id.navigation_auth) }
        binding.homeSelectedFavorite.setOnClickListener { toggleFavorite(selectedStall) }

        loadStalls()
    }

    private fun loadStalls() {
        lifecycleScope.launch {
            setBusy(true)
            try {
                val response = repository.getStalls()
                stalls = response.data.orEmpty().filterVisibleStalls()
                if (selectedStall == null && stalls.isNotEmpty()) {
                    selectedStall = stalls.first()
                }
                binding.homeStatus.text = response.error?.message ?: "Loaded ${stalls.size} stalls from the backend."
                renderScreen()
            } catch (error: Exception) {
                binding.homeStatus.text = error.message ?: "Unable to load stalls."
            } finally {
                setBusy(false)
            }
        }
    }

    private fun renderScreen() {
        updateStats()
        renderMap()
        renderSelectedStall()
        renderStallList()
    }

    private fun updateStats() {
        val favorites = favoritesStore.getFavorites()
        binding.homeStatStalls.text = stalls.size.toString()
        binding.homeStatFavorites.text = favorites.size.toString()
        binding.homeStatRole.text = sessionManager.currentUser()?.role?.takeIf { it.isNotBlank() } ?: "Guest"
        binding.homeSubheading.text = if (sessionManager.isLoggedIn) {
            "Signed in as ${sessionManager.currentUser()?.email ?: "guest"}."
        } else {
            "Sign in to submit stalls and keep favorites in sync."
        }
        binding.homeAuthBanner.isVisible = !sessionManager.isLoggedIn
        binding.homeGoToAuthButton.isVisible = !sessionManager.isLoggedIn
        binding.homeMyStallsCount.text = if (sessionManager.isLoggedIn) {
            sessionManager.currentUser()?.role ?: "USER"
        } else {
            "Guest"
        }
    }

    private fun renderMap() {
        binding.homeMap.overlays.clear()
        MapUtils.bindStallMarkers(binding.homeMap, stalls) { stall ->
            selectedStall = stall
            renderSelectedStall()
            if (settingsStore.autoCenterOnSelect && stall.latitude != null && stall.longitude != null) {
                MapUtils.centerOn(binding.homeMap, stall.latitude, stall.longitude)
            }
        }
        selectedStall?.let { stall ->
            if (stall.latitude != null && stall.longitude != null) {
                MapUtils.centerOn(binding.homeMap, stall.latitude, stall.longitude)
            }
        }
    }

    private fun renderSelectedStall() {
        val stall = selectedStall
        binding.homeSelectedCard.isVisible = stall != null
        if (stall == null) return

        binding.homeSelectedName.text = stall.name ?: "Food stall"
        binding.homeSelectedCuisine.text = stall.cuisine ?: "Cuisine"
        binding.homeSelectedDescription.text = stall.description ?: "No description available."
        binding.homeSelectedFavorite.text = if (favoritesStore.isFavorite(stall.id)) "Remove Favorite" else "Add Favorite"
    }

    private fun renderStallList() {
        binding.homeStallsContainer.removeAllViews()
        val favorites = favoritesStore.getFavorites()
        binding.homeEmptyState.isVisible = stalls.isEmpty()
        stalls.take(8).forEach { stall ->
            binding.homeStallsContainer.addView(
                StallCardFactory.create(
                    context = requireContext(),
                    parent = binding.homeStallsContainer,
                    stall = stall,
                    isFavorite = favorites.any { it.id == stall.id },
                    onOpen = {
                        selectedStall = stall
                        if (stall.latitude != null && stall.longitude != null) {
                            MapUtils.centerOn(binding.homeMap, stall.latitude, stall.longitude)
                        }
                        renderSelectedStall()
                    },
                    onFavoriteToggle = {
                        favoritesStore.toggle(stall)
                        renderScreen()
                    },
                ),
            )
        }
    }

    private fun toggleFavorite(stall: StallDto?) {
        if (stall == null) return
        favoritesStore.toggle(stall)
        renderScreen()
    }

    private fun setBusy(busy: Boolean) {
        binding.homeLoading.isVisible = busy
        binding.homeRefreshButton.isEnabled = !busy
    }

    private fun List<StallDto>.filterVisibleStalls(): List<StallDto> {
        return if (settingsStore.approvedOnly) {
            filter { it.status?.equals("APPROVED", ignoreCase = true) == true }
        } else {
            this
        }
    }

    override fun onResume() {
        super.onResume()
        binding.homeMap.onResume()
    }

    override fun onPause() {
        binding.homeMap.onPause()
        super.onPause()
    }

    override fun onDestroyView() {
        binding.homeMap.onDetach()
        super.onDestroyView()
        _binding = null
    }
}