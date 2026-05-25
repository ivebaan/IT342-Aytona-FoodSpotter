package com.aytona.foodspotter.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.aytona.foodspotter.R
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.databinding.FragmentAuthBinding

class AuthFragment : Fragment() {
    private var _binding: FragmentAuthBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager

    private val loginLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == android.app.Activity.RESULT_OK && sessionManager.isLoggedIn) {
            navigateHome()
        }
    }

    private val registrationLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == android.app.Activity.RESULT_OK && sessionManager.isLoggedIn) {
            navigateHome()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentAuthBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        binding.authLoginButton.setOnClickListener {
            loginLauncher.launch(Intent(requireContext(), LoginActivity::class.java))
        }

        binding.authRegisterButton.setOnClickListener {
            registrationLauncher.launch(Intent(requireContext(), RegistrationActivity::class.java))
        }

        if (sessionManager.isLoggedIn) {
            navigateHome()
        }
    }

    private fun navigateHome() {
        val navController = findNavController()
        if (navController.currentDestination?.id != R.id.navigation_home) {
            navController.navigate(R.id.navigation_home)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}