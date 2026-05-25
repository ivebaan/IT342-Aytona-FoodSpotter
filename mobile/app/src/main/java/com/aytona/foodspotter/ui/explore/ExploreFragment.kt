package com.aytona.foodspotter.ui.explore

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.doOnTextChanged
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.aytona.foodspotter.data.ApiClient
import com.aytona.foodspotter.data.FavoritesStore
import com.aytona.foodspotter.data.FoodSpotterRepository
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.data.SettingsStore
import com.aytona.foodspotter.data.StallDto
import com.aytona.foodspotter.databinding.FragmentExploreBinding
import com.aytona.foodspotter.ui.CuisineOptions
import com.aytona.foodspotter.ui.StallCardFactory
import com.aytona.foodspotter.ui.stalls.StallDetailsDialogFragment
import kotlinx.coroutines.launch

class ExploreFragment : Fragment() {
    private var _binding: FragmentExploreBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var favoritesStore: FavoritesStore
    private lateinit var settingsStore: SettingsStore
    private lateinit var repository: FoodSpotterRepository
    private var allStalls: List<StallDto> = emptyList()
    private var selectedCuisine: String = "All"
    private var searchQuery: String = ""

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentExploreBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        favoritesStore = FavoritesStore(requireContext())
        settingsStore = SettingsStore(requireContext())
        repository = FoodSpotterRepository(ApiClient.service, sessionManager)

        binding.exploreCuisineField.setAdapter(
            android.widget.ArrayAdapter(requireContext(), android.R.layout.simple_list_item_1, listOf("All") + CuisineOptions.values),
        )
        binding.exploreCuisineField.setText("All", false)
        binding.exploreCuisineField.setOnItemClickListener { _, _, position, _ ->
            selectedCuisine = (binding.exploreCuisineField.adapter.getItem(position) as? String) ?: "All"
            renderList()
        }

        binding.exploreSearchInput.doOnTextChanged { text, _, _, _ ->
            searchQuery = text?.toString().orEmpty()
            renderList()
        }

        binding.exploreRefreshButton.setOnClickListener { loadStalls() }
        loadStalls()
    }

    private fun loadStalls() {
        lifecycleScope.launch {
            binding.exploreLoading.visibility = View.VISIBLE
            try {
                Log.d("ExploreFragment", "Fetching stalls from backend...")
                val response = repository.getStalls()
                Log.d("ExploreFragment", "Response received: success=${response.success}, data=${response.data?.size}, error=${response.error?.message}")
                
                if (!response.success && response.error != null) {
                    val errorMsg = "API Error: ${response.error.code} - ${response.error.message}"
                    binding.exploreStatus.text = errorMsg
                    Log.e("ExploreFragment", errorMsg)
                    return@launch
                }
                
                allStalls = response.data.orEmpty().filterVisibleStalls()
                binding.exploreStatus.text = "Showing ${allStalls.size} stalls from the backend."
                Log.d("ExploreFragment", "Successfully loaded ${allStalls.size} stalls")
                renderList()
            } catch (error: Exception) {
                val errorDetails = "${error.javaClass.simpleName}: ${error.message}"
                binding.exploreStatus.text = "Error: $errorDetails"
                Log.e("ExploreFragment", "Error loading stalls: $errorDetails", error)
            } finally {
                binding.exploreLoading.visibility = View.GONE
            }
        }
    }

    private fun renderList() {
        val favorites = favoritesStore.getFavorites()
        val filtered = allStalls.filter {
            val matchesCuisine = selectedCuisine == "All" || it.cuisine.equals(selectedCuisine, ignoreCase = true)
            val query = searchQuery.trim().lowercase()
            val matchesSearch = query.isBlank() || listOfNotNull(it.name, it.description, it.cuisine).joinToString(" ").lowercase().contains(query)
            matchesCuisine && matchesSearch
        }
        binding.exploreResultsContainer.removeAllViews()
        binding.exploreEmptyState.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
        filtered.forEach { stall ->
            binding.exploreResultsContainer.addView(
                StallCardFactory.create(
                    context = requireContext(),
                    parent = binding.exploreResultsContainer,
                    stall = stall,
                    isFavorite = favorites.any { it.id == stall.id },
                    onOpen = {
                        binding.exploreStatus.text = "Selected ${stall.name ?: "stall"}."
                        StallDetailsDialogFragment.show(parentFragmentManager, stall)
                    },
                    onFavoriteToggle = {
                        favoritesStore.toggle(stall)
                        renderList()
                    },
                ),
            )
        }
    }

    private fun List<StallDto>.filterVisibleStalls(): List<StallDto> {
        return if (settingsStore.approvedOnly) {
            filter { it.status?.equals("APPROVED", ignoreCase = true) == true }
        } else {
            this
        }
    }
}
