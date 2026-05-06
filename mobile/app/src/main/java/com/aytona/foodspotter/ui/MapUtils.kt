package com.aytona.foodspotter.ui

import android.content.Context
import org.osmdroid.config.Configuration
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker

object MapUtils {
    fun initialize(context: Context) {
        Configuration.getInstance().userAgentValue = context.packageName
    }

    fun prepareMap(mapView: MapView) {
        mapView.setMultiTouchControls(true)
        mapView.controller.setZoom(13.5)
        mapView.controller.setCenter(defaultPoint())
    }

    fun defaultPoint(): GeoPoint = GeoPoint(10.3157, 123.8854)

    fun centerOn(mapView: MapView, latitude: Double, longitude: Double, zoom: Double = 16.0) {
        mapView.controller.setZoom(zoom)
        mapView.controller.setCenter(GeoPoint(latitude, longitude))
    }

    fun bindStallMarkers(
        mapView: MapView,
        stalls: List<com.aytona.foodspotter.data.StallDto>,
        onSelected: (com.aytona.foodspotter.data.StallDto) -> Unit,
    ) {
        mapView.overlays.removeAll { it is Marker }
        stalls.forEach { stall ->
            val latitude = stall.latitude ?: return@forEach
            val longitude = stall.longitude ?: return@forEach
            val marker = Marker(mapView).apply {
                position = GeoPoint(latitude, longitude)
                title = stall.name ?: "Food stall"
                snippet = stall.cuisine ?: "Cuisine"
                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                setOnMarkerClickListener { _, _ ->
                    onSelected(stall)
                    true
                }
            }
            mapView.overlays.add(marker)
        }
        mapView.invalidate()
    }
}
