package com.aytona.foodspotter.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aytona.foodspotter.R
import com.aytona.foodspotter.data.ApiClient
import com.aytona.foodspotter.data.FoodSpotterRepository
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.data.StallDto
import com.aytona.foodspotter.databinding.FragmentProfileBinding
import com.aytona.foodspotter.ui.StallCardFactory
import kotlinx.coroutines.launch

class ProfileFragment : Fragment() {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var repository: FoodSpotterRepository
    private var myStalls: List<StallDto> = emptyList()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        repository = FoodSpotterRepository(ApiClient.service, sessionManager)

        binding.profileSettingsButton.setOnClickListener { findNavController().navigate(R.id.navigation_settings) }
        binding.profileLogoutButton.setOnClickListener {
            sessionManager.clear()
            findNavController().navigate(R.id.navigation_auth)
        }
        renderProfile()
        loadMyStalls()
    }

    private fun renderProfile() {
        val user = sessionManager.currentUser()
        binding.profileName.text = listOfNotNull(user?.firstname, user?.lastname).joinToString(" ").ifBlank { "Guest Explorer" }
        binding.profileEmail.text = user?.email ?: "Sign in to unlock your profile."
        binding.profileRole.text = user?.role ?: "Guest"
        binding.profileAvatar.text = user?.firstname?.firstOrNull()?.uppercaseChar()?.toString() ?: "F"
        binding.profileLoginPrompt.visibility = if (sessionManager.isLoggedIn) View.GONE else View.VISIBLE
        binding.profileLogoutButton.isEnabled = sessionManager.isLoggedIn
    }

    private fun loadMyStalls() {
        if (!sessionManager.isLoggedIn) {
            binding.profileStallsContainer.removeAllViews()
            binding.profileStallsEmpty.visibility = View.VISIBLE
            return
        }

        lifecycleScope.launch {
            try {
                val response = repository.getMyStalls()
                myStalls = response.data.orEmpty()
                binding.profileStallsEmpty.visibility = if (myStalls.isEmpty()) View.VISIBLE else View.GONE
                binding.profileStallsContainer.removeAllViews()
                myStalls.forEach { stall ->
                    binding.profileStallsContainer.addView(
                        StallCardFactory.create(
                            context = requireContext(),
                            parent = binding.profileStallsContainer,
                            stall = stall,
                            isFavorite = false,
                            onOpen = {},
                            onFavoriteToggle = null,
                        ),
                    )
                }
            } catch (_: Exception) {
                binding.profileStallsEmpty.visibility = View.VISIBLE
            }
        }
    }
}
