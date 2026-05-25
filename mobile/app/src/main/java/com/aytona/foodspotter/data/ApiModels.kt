package com.aytona.foodspotter.data

data class ApiResponse<T>(
    val success: Boolean = false,
    val data: T? = null,
    val error: ErrorResponse? = null,
    val timestamp: String? = null,
)

data class ErrorResponse(
    val code: String? = null,
    val message: String? = null,
    val details: Any? = null,
)

data class UserDto(
    val firstname: String? = null,
    val lastname: String? = null,
    val email: String? = null,
    val role: String? = null,
)

data class AuthData(
    val user: UserDto? = null,
    val accessToken: String? = null,
)

data class LoginRequest(
    val email: String,
    val password: String,
)

data class RegisterRequest(
    val firstname: String,
    val lastname: String,
    val email: String,
    val password: String,
)

data class StallDto(
    val id: Long? = null,
    val name: String? = null,
    val description: String? = null,
    val cuisine: String? = null,
    val imageUrl: String? = null,
    val imageSizeBytes: Long? = null,
    val address: String? = null,
    val menuJson: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val status: String? = null,
    val ownerEmail: String? = null,
)

data class StallRequest(
    val name: String,
    val description: String,
    val cuisine: String,
    val imageUrl: String,
    val address: String? = null,
    val latitude: String,
    val longitude: String,
)
