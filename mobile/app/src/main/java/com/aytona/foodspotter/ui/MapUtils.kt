package com.aytona.foodspotter.ui

import android.content.Context
import android.os.Bundle
import android.util.Log
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions

object MapUtils : OnMapReadyCallback {
    private const val TAG = "MapUtils"
    private var googleMap: GoogleMap? = null
    private var pendingStalls: List<com.aytona.foodspotter.data.StallDto> = emptyList()
    private var pendingCallback: ((com.aytona.foodspotter.data.StallDto) -> Unit)? = null
    private val DEFAULT_LAT = 10.3157
    private val DEFAULT_LNG = 123.8854

    fun initialize(context: Context) {
        Log.d(TAG, "MapUtils initialized for Google Maps")
    }

    fun prepareMap(mapView: MapView) {
        mapView.onCreate(null)
        mapView.getMapAsync { googleMap ->
            this.googleMap = googleMap
            
            // Enable all gestures for full interactivity
            googleMap.uiSettings.isScrollGesturesEnabled = true
            googleMap.uiSettings.isZoomGesturesEnabled = true
            googleMap.uiSettings.isRotateGesturesEnabled = true
            googleMap.uiSettings.isTiltGesturesEnabled = true
            googleMap.uiSettings.isZoomControlsEnabled = true
            Log.d(TAG, "Map gestures enabled")
            
            googleMap.moveCamera(
                CameraUpdateFactory.newLatLngZoom(
                    LatLng(DEFAULT_LAT, DEFAULT_LNG),
                    13.5f
                )
            )
            Log.d(TAG, "Google Map prepared - center: Cebu (10.3157, 123.8854), zoom: 13.5")
            
            // Bind any pending stalls
            if (pendingStalls.isNotEmpty() && pendingCallback != null) {
                Log.d(TAG, "Binding ${pendingStalls.size} pending stalls")
                bindStallMarkersInternal(pendingStalls, pendingCallback!!)
                pendingStalls = emptyList()
                pendingCallback = null
            } else {
                Log.d(TAG, "No pending stalls to bind")
            }
        }
        mapView.onResume()
    }

    fun defaultPoint(): LatLng = LatLng(DEFAULT_LAT, DEFAULT_LNG)

    fun centerOn(mapView: MapView, latitude: Double, longitude: Double, zoom: Float = 16.0f) {
        googleMap?.moveCamera(
            CameraUpdateFactory.newLatLngZoom(
                LatLng(latitude, longitude),
                zoom
            )
        )
        Log.d(TAG, "Map centered on: ($latitude, $longitude), zoom: $zoom")
    }

    fun getCameraCenter(onReady: (Double, Double) -> Unit) {
        val map = googleMap
        if (map == null) {
            Log.w(TAG, "Map not ready; returning default camera center")
            onReady(DEFAULT_LAT, DEFAULT_LNG)
            return
        }
        val target = map.cameraPosition.target
        onReady(target.latitude, target.longitude)
    }

    fun bindStallMarkers(
        mapView: MapView,
        stalls: List<com.aytona.foodspotter.data.StallDto>,
        onSelected: (com.aytona.foodspotter.data.StallDto) -> Unit,
    ) {
        Log.d(TAG, "bindStallMarkers called with ${stalls.size} stalls, map ready: ${googleMap != null}")
        if (googleMap != null) {
            Log.d(TAG, "Map ready, binding markers immediately")
            bindStallMarkersInternal(stalls, onSelected)
        } else {
            // Store for later when map is ready
            Log.w(TAG, "Map not ready yet, storing ${stalls.size} stalls for later binding")
            pendingStalls = stalls
            pendingCallback = onSelected
        }
    }

    private fun bindStallMarkersInternal(
        stalls: List<com.aytona.foodspotter.data.StallDto>,
        onSelected: (com.aytona.foodspotter.data.StallDto) -> Unit,
    ) {
        val map = googleMap ?: run {
            Log.w(TAG, "Google Map is not initialized")
            return
        }
        
        Log.d(TAG, "bindStallMarkers called with ${stalls.size} stalls")
        map.clear()
        Log.d(TAG, "Cleared all markers from map")
        
        var addedCount = 0
        var skippedCount = 0
        
        stalls.forEach { stall ->
            val latitude = stall.latitude
            val longitude = stall.longitude
            
            if (latitude == null || longitude == null) {
                Log.w(TAG, "Skipping stall '${stall.name}' - missing coordinates (lat=$latitude, lng=$longitude)")
                skippedCount++
                return@forEach
            }
            
            try {
                val markerOptions = MarkerOptions()
                    .position(LatLng(latitude, longitude))
                    .title(stall.name ?: "Food stall")
                    .snippet(stall.cuisine ?: "Cuisine")
                
                val marker = map.addMarker(markerOptions)
                marker?.tag = stall
                addedCount++
                Log.d(TAG, "Added marker: ${stall.name} at ($latitude, $longitude)")
            } catch (e: Exception) {
                Log.e(TAG, "Error adding marker for ${stall.name}", e)
            }
        }
        
        // Set marker click listener
        map.setOnMarkerClickListener { marker ->
            val stall = marker.tag as? com.aytona.foodspotter.data.StallDto
            if (stall != null) {
                Log.d(TAG, "Marker clicked: ${stall.name}")
                onSelected(stall)
                true
            } else {
                false
            }
        }
        
        Log.d(TAG, "Marker binding complete: added=$addedCount, skipped=$skippedCount")
    }

    override fun onMapReady(map: GoogleMap) {
        this.googleMap = map
        Log.d(TAG, "onMapReady called")
    }
}
