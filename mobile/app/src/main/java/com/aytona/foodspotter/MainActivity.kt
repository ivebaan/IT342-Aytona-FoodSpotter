package com.aytona.foodspotter

import android.os.Bundle
import com.google.android.material.bottomnavigation.BottomNavigationView
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.aytona.foodspotter.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.hide()

        val navView: BottomNavigationView = binding.navView
        val navController = findNavController(R.id.nav_host_fragment_activity_main)
        val appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.navigation_auth,
                R.id.navigation_home,
                R.id.navigation_explore,
                R.id.navigation_favorites,
                R.id.navigation_profile,
                R.id.navigation_settings,
                R.id.navigation_add_stall,
            ),
        )

        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)

        binding.fabAddStall.setOnClickListener {
            navController.navigate(R.id.navigation_add_stall)
        }

        navController.addOnDestinationChangedListener { _, destination, _ ->
            val showShell = destination.id != R.id.navigation_auth
            navView.visibility = if (showShell) android.view.View.VISIBLE else android.view.View.GONE
            binding.fabAddStall.visibility = if (showShell) android.view.View.VISIBLE else android.view.View.GONE
        }
    }
}