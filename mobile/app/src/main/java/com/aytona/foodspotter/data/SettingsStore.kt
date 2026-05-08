package com.aytona.foodspotter.data

import android.content.Context

class SettingsStore(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var approvedOnly: Boolean
        get() = prefs.getBoolean(KEY_APPROVED_ONLY, false)
        set(value) = prefs.edit().putBoolean(KEY_APPROVED_ONLY, value).apply()

    var autoCenterOnSelect: Boolean
        get() = prefs.getBoolean(KEY_AUTO_CENTER, true)
        set(value) = prefs.edit().putBoolean(KEY_AUTO_CENTER, value).apply()

    var showMyStallsFirst: Boolean
        get() = prefs.getBoolean(KEY_MY_STALLS_FIRST, true)
        set(value) = prefs.edit().putBoolean(KEY_MY_STALLS_FIRST, value).apply()

    companion object {
        private const val PREFS_NAME = "foodspotter_settings"
        private const val KEY_APPROVED_ONLY = "approved_only"
        private const val KEY_AUTO_CENTER = "auto_center"
        private const val KEY_MY_STALLS_FIRST = "my_stalls_first"
    }
}
