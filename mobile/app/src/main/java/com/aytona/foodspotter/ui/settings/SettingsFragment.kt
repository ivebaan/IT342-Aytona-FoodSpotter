package com.aytona.foodspotter.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.aytona.foodspotter.R
import com.aytona.foodspotter.data.FavoritesStore
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.data.SettingsStore
import com.aytona.foodspotter.databinding.FragmentSettingsBinding

class SettingsFragment : Fragment() {
    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var favoritesStore: FavoritesStore
    private lateinit var settingsStore: SettingsStore

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentSettingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        favoritesStore = FavoritesStore(requireContext())
        settingsStore = SettingsStore(requireContext())

        val user = sessionManager.currentUser()
        binding.settingsAccountSummary.text = if (sessionManager.isLoggedIn) {
            val name = listOfNotNull(user?.firstname, user?.lastname).joinToString(" ").ifBlank { user?.email.orEmpty() }
            val role = user?.role?.takeIf { it.isNotBlank() } ?: "USER"
            "Signed in as $name • $role"
        } else {
            "You’re browsing as a guest. Sign in to sync favorites and stall submissions."
        }

        binding.settingsApprovedOnly.isChecked = settingsStore.approvedOnly
        binding.settingsAutoCenter.isChecked = settingsStore.autoCenterOnSelect
        binding.settingsMyStallsFirst.isChecked = settingsStore.showMyStallsFirst

        binding.settingsApprovedOnly.setOnCheckedChangeListener { _, checked -> settingsStore.approvedOnly = checked }
        binding.settingsAutoCenter.setOnCheckedChangeListener { _, checked -> settingsStore.autoCenterOnSelect = checked }
        binding.settingsMyStallsFirst.setOnCheckedChangeListener { _, checked -> settingsStore.showMyStallsFirst = checked }

        binding.settingsClearFavorites.setOnClickListener {
            AlertDialog.Builder(requireContext())
                .setTitle("Clear favorites?")
                .setMessage("This will remove all saved stalls on this device.")
                .setPositiveButton("Clear") { _, _ ->
                    favoritesStore.clear()
                    binding.settingsMessage.text = "Favorites cleared."
                    binding.settingsAccountSummary.text = if (sessionManager.isLoggedIn) {
                        "Signed in settings saved. Favorites are now empty."
                    } else {
                        "Guest mode active. Favorites are now empty."
                    }
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
        binding.settingsLogout.setOnClickListener {
            AlertDialog.Builder(requireContext())
                .setTitle("Log out?")
                .setMessage("You will be returned to the sign-in screen.")
                .setPositiveButton("Log out") { _, _ ->
                    sessionManager.clear()
                    navigateSafely(R.id.navigation_auth)
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
        binding.settingsBackHome.setOnClickListener { navigateSafely(R.id.navigation_home) }
    }

    private fun navigateSafely(destinationId: Int) {
        val navController = findNavController()
        if (navController.currentDestination?.id == destinationId) return
        runCatching { navController.navigate(destinationId) }
    }
}
