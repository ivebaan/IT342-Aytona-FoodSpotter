package com.aytona.foodspotter.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.aytona.foodspotter.data.ApiClient
import com.aytona.foodspotter.data.FoodSpotterRepository
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.databinding.FragmentAuthBinding
import kotlinx.coroutines.launch

class AuthFragment : Fragment() {
    private var _binding: FragmentAuthBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager
    private lateinit var repository: FoodSpotterRepository

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
        repository = FoodSpotterRepository(ApiClient.service, sessionManager)
        setupActions()
        showMode(isRegister = true)
    }

    private fun setupActions() {
        binding.loginButton.setOnClickListener { submitLogin() }
        binding.registerButton.setOnClickListener { submitRegister() }
        binding.authLoginTab.setOnClickListener { showMode(isRegister = false) }
        binding.authRegisterTab.setOnClickListener { showMode(isRegister = true) }
    }

    private fun submitLogin() {
        val email = binding.loginEmail.editText?.text?.toString()?.trim().orEmpty()
        val password = binding.loginPassword.editText?.text?.toString()?.trim().orEmpty()
        if (email.isBlank() || password.isBlank()) {
            showStatus("Enter your email and password.", error = true)
            return
        }

        lifecycleScope.launch {
            setLoading(true)
            try {
                val response = repository.login(email, password)
                if (response.success && response.data?.accessToken != null) {
                    sessionManager.saveSession(response.data)
                    showStatus("Welcome back.", error = false)
                    findNavController().navigate(com.aytona.foodspotter.R.id.navigation_home)
                } else {
                    showStatus(response.error?.message ?: "Login failed.", error = true)
                }
            } catch (error: Exception) {
                showStatus(error.message ?: "Login failed.", error = true)
            } finally {
                setLoading(false)
            }
        }
    }

    private fun submitRegister() {
        val firstname = binding.registerFirstname.editText?.text?.toString()?.trim().orEmpty()
        val lastname = binding.registerLastname.editText?.text?.toString()?.trim().orEmpty()
        val email = binding.registerEmail.editText?.text?.toString()?.trim().orEmpty()
        val password = binding.registerPassword.editText?.text?.toString()?.trim().orEmpty()
        val confirmPassword = binding.registerConfirmPassword.editText?.text?.toString()?.trim().orEmpty()
        if (firstname.isBlank() || lastname.isBlank() || email.isBlank() || password.length < 8) {
            showStatus("Fill out the registration form completely.", error = true)
            return
        }
        if (password != confirmPassword) {
            showStatus("Passwords do not match.", error = true)
            return
        }

        lifecycleScope.launch {
            setLoading(true)
            try {
                val response = repository.register(firstname, lastname, email, password)
                if (response.success && response.data?.accessToken != null) {
                    sessionManager.saveSession(response.data)
                    showStatus("Account created.", error = false)
                    findNavController().navigate(com.aytona.foodspotter.R.id.navigation_home)
                } else {
                    showStatus(response.error?.message ?: "Registration failed.", error = true)
                }
            } catch (error: Exception) {
                showStatus(error.message ?: "Registration failed.", error = true)
            } finally {
                setLoading(false)
            }
        }
    }

    private fun showMode(isRegister: Boolean) {
        binding.registerSection.isVisible = isRegister
        binding.loginSection.isVisible = !isRegister
        binding.authSubtitle.text = if (isRegister) {
            "Create an account to save favorites and submit stalls."
        } else {
            "Sign in to continue to your map, profile, and stalls."
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.loginButton.isEnabled = !loading
        binding.registerButton.isEnabled = !loading
        binding.authLoading.isVisible = loading
        binding.authMessage.isVisible = loading.not() && binding.authMessage.text.isNotBlank()
    }

    private fun showStatus(message: String, error: Boolean) {
        binding.authMessage.text = message
        binding.authMessage.setTextColor(
            requireContext().getColor(
                if (error) com.google.android.material.R.color.design_default_color_error else android.R.color.holo_green_dark,
            ),
        )
        binding.authMessage.isVisible = true
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
