package com.aytona.foodspotter

import android.os.Bundle
import com.google.android.material.bottomnavigation.BottomNavigationView
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.NavOptions
import androidx.navigation.NavDestination
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.ui.onNavDestinationSelected
import com.aytona.foodspotter.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val navView: BottomNavigationView = binding.navView
        val navController = findNavController(R.id.nav_host_fragment_activity_main)

        navView.setOnItemSelectedListener { item ->
            if (item.itemId == navController.currentDestination?.id) {
                return@setOnItemSelectedListener true
            }

            when (item.itemId) {
                R.id.navigation_home,
                R.id.navigation_explore,
                R.id.navigation_favorites,
                R.id.navigation_profile,
                R.id.navigation_settings -> {
                    val options = NavOptions.Builder()
                        .setLaunchSingleTop(true)
                        .setRestoreState(true)
                        .setPopUpTo(
                            navController.graph.findStartDestination().id,
                            false,
                            true,
                        )
                        .build()
                    navController.navigate(item.itemId, null, options)
                    true
                }
                else -> false
            }
        }

        navController.addOnDestinationChangedListener { _, destination, _ ->
            syncBottomNavSelection(navView, destination)
            val showShell = destination.id != R.id.navigation_auth
            navView.visibility = if (showShell) android.view.View.VISIBLE else android.view.View.GONE
            binding.fabAddStall.visibility = if (showShell) android.view.View.VISIBLE else android.view.View.GONE
        }

        binding.fabAddStall.setOnClickListener {
            navController.navigate(R.id.navigation_add_stall)
        }
    }

    private fun syncBottomNavSelection(navView: BottomNavigationView, destination: NavDestination) {
        val selectedItemId = when (destination.id) {
            R.id.navigation_home,
            R.id.navigation_explore,
            R.id.navigation_favorites,
            R.id.navigation_profile,
            R.id.navigation_settings -> destination.id
            else -> null
        }

        if (selectedItemId != null && navView.selectedItemId != selectedItemId) {
            navView.menu.findItem(selectedItemId)?.isChecked = true
        }
    }
}