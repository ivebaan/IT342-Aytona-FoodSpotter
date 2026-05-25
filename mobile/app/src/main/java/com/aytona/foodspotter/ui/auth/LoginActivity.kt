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
import com.aytona.foodspotter.databinding.ActivityLoginBinding
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var repository: FoodSpotterRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        repository = FoodSpotterRepository(ApiClient.service, sessionManager)

        binding.loginSubmitButton.setOnClickListener { submitLogin() }
        binding.loginCreateAccountButton.setOnClickListener {
            startActivity(Intent(this, RegistrationActivity::class.java))
            finish()
        }
    }

    private fun submitLogin() {
        val email = binding.editEmail.text?.toString()?.trim().orEmpty()
        val password = binding.editPassword.text?.toString()?.trim().orEmpty()

        if (email.isBlank() || password.isBlank()) {
            Toast.makeText(this, "Enter your email and password.", Toast.LENGTH_SHORT).show()
            return
        }

        lifecycleScope.launch {
            setLoading(true)
            try {
                val response = repository.login(email, password)
                if (response.success && response.data?.accessToken != null) {
                    sessionManager.saveSession(response.data)
                    startActivity(
                        Intent(this@LoginActivity, MainActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK)
                        },
                    )
                    finish()
                } else {
                    Toast.makeText(
                        this@LoginActivity,
                        response.error?.message ?: "Login failed.",
                        Toast.LENGTH_SHORT,
                    ).show()
                }
            } catch (error: Exception) {
                Toast.makeText(this@LoginActivity, error.message ?: "Login failed.", Toast.LENGTH_SHORT).show()
            } finally {
                setLoading(false)
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        binding.loginSubmitButton.isEnabled = !loading
        binding.loginCreateAccountButton.isEnabled = !loading
    }
}