package com.aytona.foodspotter.data

import android.content.Context
import com.google.gson.Gson

class SessionManager(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    val isLoggedIn: Boolean
        get() = bearerToken() != null

    fun saveSession(authData: AuthData) {
        prefs.edit()
            .putString(KEY_TOKEN, authData.accessToken)
            .putString(KEY_USER, gson.toJson(authData.user))
            .apply()
    }

    fun bearerToken(): String? {
        val token = prefs.getString(KEY_TOKEN, null)?.trim().orEmpty()
        return if (token.isBlank()) null else "Bearer $token"
    }

    fun currentUser(): UserDto? {
        val raw = prefs.getString(KEY_USER, null) ?: return null
        return runCatching { gson.fromJson(raw, UserDto::class.java) }.getOrNull()
    }

    fun updateRole(role: String?) {
        val user = currentUser() ?: return
        val updated = user.copy(role = role)
        prefs.edit().putString(KEY_USER, gson.toJson(updated)).apply()
    }

    fun clear() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val PREFS_NAME = "foodspotter_session"
        private const val KEY_TOKEN = "token"
        private const val KEY_USER = "user"
    }
}
