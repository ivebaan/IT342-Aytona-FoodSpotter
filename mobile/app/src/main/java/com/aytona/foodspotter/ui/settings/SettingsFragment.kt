package com.aytona.foodspotter.ui.settings

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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

        binding.settingsApprovedOnly.isChecked = settingsStore.approvedOnly
        binding.settingsAutoCenter.isChecked = settingsStore.autoCenterOnSelect
        binding.settingsMyStallsFirst.isChecked = settingsStore.showMyStallsFirst

        binding.settingsApprovedOnly.setOnCheckedChangeListener { _, checked -> settingsStore.approvedOnly = checked }
        binding.settingsAutoCenter.setOnCheckedChangeListener { _, checked -> settingsStore.autoCenterOnSelect = checked }
        binding.settingsMyStallsFirst.setOnCheckedChangeListener { _, checked -> settingsStore.showMyStallsFirst = checked }

        binding.settingsClearFavorites.setOnClickListener {
            favoritesStore.clear()
            binding.settingsMessage.text = "Favorites cleared."
        }
        binding.settingsLogout.setOnClickListener {
            sessionManager.clear()
            findNavController().navigate(R.id.navigation_auth)
        }
        binding.settingsBackHome.setOnClickListener { findNavController().navigate(R.id.navigation_home) }
    }
}
