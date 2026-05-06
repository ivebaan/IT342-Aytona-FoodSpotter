package com.aytona.foodspotter.ui.addstall

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aytona.foodspotter.R
import com.aytona.foodspotter.data.ApiClient
import com.aytona.foodspotter.data.FoodSpotterRepository
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.data.StallRequest
import com.aytona.foodspotter.databinding.FragmentAddStallBinding
import com.aytona.foodspotter.ui.CuisineOptions
import com.aytona.foodspotter.ui.MapUtils
import kotlinx.coroutines.launch

class AddStallFragment : Fragment() {
    private var _binding: FragmentAddStallBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var repository: FoodSpotterRepository
    private var selectedLatitude: Double? = null
    private var selectedLongitude: Double? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAddStallBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        repository = FoodSpotterRepository(ApiClient.service, sessionManager)
        if (!sessionManager.isLoggedIn) {
            binding.addStallMessage.text = "Sign in first to submit a stall."
            binding.addStallSubmit.isEnabled = false
            binding.addStallLoginButton.setOnClickListener { findNavController().navigate(R.id.navigation_auth) }
        }
        binding.addStallLoginButton.isVisible = !sessionManager.isLoggedIn

        MapUtils.initialize(requireContext())
        MapUtils.prepareMap(binding.addStallMap)
        binding.addStallCuisine.setAdapter(ArrayAdapter(requireContext(), android.R.layout.simple_list_item_1, CuisineOptions.values))
        binding.addStallPickLocationButton.setOnClickListener {
            val center = binding.addStallMap.mapCenter
            selectedLatitude = center.latitude
            selectedLongitude = center.longitude
            binding.addStallLocation.text = "Selected: ${String.format("%.5f", selectedLatitude)} , ${String.format("%.5f", selectedLongitude)}"
            binding.addStallMessage.text = "Location captured from the current map center."
        }

        binding.addStallSubmit.setOnClickListener { submitStall() }
    }

    private fun submitStall() {
        val name = binding.addStallName.editText?.text?.toString()?.trim().orEmpty()
        val description = binding.addStallDescription.editText?.text?.toString()?.trim().orEmpty()
        val cuisine = binding.addStallCuisine.text?.toString()?.trim().orEmpty()
        val latitude = selectedLatitude
        val longitude = selectedLongitude

        if (name.length < 3 || description.length < 10 || cuisine.isBlank() || latitude == null || longitude == null) {
            binding.addStallMessage.text = "Fill out the form and pick a point on the map."
            return
        }

        lifecycleScope.launch {
            binding.addStallSubmit.isEnabled = false
            try {
                val response = repository.createStall(
                    StallRequest(
                        name = name,
                        description = description,
                        cuisine = cuisine,
                        latitude = latitude.toString(),
                        longitude = longitude.toString(),
                    ),
                )
                if (response.success) {
                    sessionManager.updateRole("VENDOR")
                    binding.addStallMessage.text = "Stall submitted for approval."
                    findNavController().navigate(R.id.navigation_home)
                } else {
                    binding.addStallMessage.text = response.error?.message ?: "Failed to submit stall."
                }
            } catch (error: Exception) {
                binding.addStallMessage.text = error.message ?: "Failed to submit stall."
            } finally {
                binding.addStallSubmit.isEnabled = sessionManager.isLoggedIn
            }
        }
    }

    override fun onResume() {
        super.onResume()
        binding.addStallMap.onResume()
    }

    override fun onPause() {
        binding.addStallMap.onPause()
        super.onPause()
    }

    override fun onDestroyView() {
        binding.addStallMap.onDetach()
        super.onDestroyView()
        _binding = null
    }
}
