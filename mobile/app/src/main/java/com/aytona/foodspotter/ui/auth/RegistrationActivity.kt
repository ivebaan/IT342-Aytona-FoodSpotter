package com.aytona.foodspotter.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.aytona.foodspotter.MainActivity
import com.aytona.foodspotter.data.ApiClient
import com.aytona.foodspotter.data.FoodSpotterRepository
import com.aytona.foodspotter.data.SessionManager
import com.aytona.foodspotter.databinding.ActivityRegistrationBinding
import kotlinx.coroutines.launch

class RegistrationActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegistrationBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var repository: FoodSpotterRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegistrationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        repository = FoodSpotterRepository(ApiClient.service, sessionManager)

        binding.registerSubmitButton.setOnClickListener { submitRegister() }
        binding.registerLoginButton.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun submitRegister() {
        val firstname = binding.editFirstName.text?.toString()?.trim().orEmpty()
        val lastname = binding.editLastName.text?.toString()?.trim().orEmpty()
        val email = binding.editEmail.text?.toString()?.trim().orEmpty()
        val password = binding.editPassword.text?.toString()?.trim().orEmpty()

        if (firstname.isBlank() || lastname.isBlank() || email.isBlank() || password.length < 8) {
            Toast.makeText(this, "Fill out the registration form completely.", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            setLoading(true)
            try {
                val response = repository.register(firstname, lastname, email, password)
                if (response.success && response.data?.accessToken != null) {
                    sessionManager.saveSession(response.data)
                    startActivity(
                        Intent(this@RegistrationActivity, MainActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
                        },
                    )
                    finish()
                } else {
                    Toast.makeText(
                        this@RegistrationActivity,
                        response.error?.message ?: "Registration failed.",
                        Toast.LENGTH_SHORT,
                    ).show()
                }
            } catch (error: Exception) {
                Toast.makeText(this@RegistrationActivity, error.message ?: "Registration failed.", Toast.LENGTH_SHORT).show()
            } finally {
                setLoading(false)
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.registerSubmitButton.isEnabled = !loading
        binding.registerLoginButton.isEnabled = !loading
    }
}