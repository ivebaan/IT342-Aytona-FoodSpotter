package com.aytona.foodspotter.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.util.Log
import android.widget.Toast
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
    private var mapExpanded: Boolean = false

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

        binding.homeMapExpand.setOnClickListener {
            toggleMapExpanded()
        }

        loadStalls()
    }

    private fun loadStalls() {
        lifecycleScope.launch {
            setBusy(true)
            try {
                Log.d("HomeFragment", "Fetching stalls from backend...")
                val response = repository.getStalls()
                Log.d("HomeFragment", "Response received: success=${response.success}, data=${response.data?.size}, error=${response.error?.message}")
                
                if (!response.success && response.error != null) {
                    val errorMsg = "API Error: ${response.error.code} - ${response.error.message}"
                    binding.homeStatus.text = errorMsg
                    Log.e("HomeFragment", errorMsg)
                    Toast.makeText(requireContext(), errorMsg, Toast.LENGTH_LONG).show()
                    return@launch
                }
                
                val rawStalls = response.data.orEmpty()
                Log.d("HomeFragment", "Raw stalls count: ${rawStalls.size}")
                rawStalls.forEachIndexed { idx, stall ->
                    Log.d("HomeFragment", "Stall[$idx]: name=${stall.name}, lat=${stall.latitude}, lng=${stall.longitude}, status=${stall.status}")
                }
                
                stalls = rawStalls.filterVisibleStalls()
                Log.d("HomeFragment", "After filtering: ${stalls.size} visible stalls")
                
                if (selectedStall == null && stalls.isNotEmpty()) {
                    selectedStall = stalls.first()
                }
                binding.homeStatus.text = "Loaded ${stalls.size} stalls from the backend."
                Log.d("HomeFragment", "Successfully loaded ${stalls.size} stalls")
                renderScreen()
            } catch (error: Exception) {
                val errorDetails = "${error.javaClass.simpleName}: ${error.message}"
                binding.homeStatus.text = "Error: $errorDetails"
                Log.e("HomeFragment", "Error loading stalls: $errorDetails", error)
                Toast.makeText(requireContext(), errorDetails, Toast.LENGTH_LONG).show()
            } finally {
                setBusy(false)
            }
        }
    }

    private fun toggleMapExpanded() {
        mapExpanded = !mapExpanded
        val params = binding.homeMapContainer.layoutParams
        if (mapExpanded) {
            params.height = ViewGroup.LayoutParams.MATCH_PARENT
            binding.homeStallsContainer.visibility = View.GONE
            binding.homeEmptyState.visibility = View.GONE
            binding.homeSelectedCard.visibility = View.GONE
        } else {
            val dp320 = (320 * resources.displayMetrics.density).toInt()
            params.height = dp320
            binding.homeStallsContainer.visibility = View.VISIBLE
            binding.homeEmptyState.visibility = if (stalls.isEmpty()) View.VISIBLE else View.GONE
            binding.homeSelectedCard.visibility = if (selectedStall != null) View.VISIBLE else View.GONE
        }
        binding.homeMapContainer.layoutParams = params
        binding.homeMap.requestLayout()
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
        binding.homeMap.onDestroy()
        super.onDestroyView()
        _binding = null
    }
}