package com.aytona.foodspotter.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface FoodSpotterApiService {
    @POST("/auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<AuthData>

    @POST("/auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<AuthData>

    @GET("/stalls")
    suspend fun getStalls(): ApiResponse<List<StallDto>>

    @GET("/stalls/me")
    suspend fun getMyStalls(@Header("Authorization") authorization: String): ApiResponse<List<StallDto>>

    @POST("/stalls")
    suspend fun createStall(
        @Header("Authorization") authorization: String,
        @Body request: StallRequest,
    ): ApiResponse<StallDto>
}
