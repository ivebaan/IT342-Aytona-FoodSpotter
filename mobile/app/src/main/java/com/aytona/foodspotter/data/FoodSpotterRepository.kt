package com.aytona.foodspotter.data

class FoodSpotterRepository(
    private val service: FoodSpotterApiService,
    private val sessionManager: SessionManager,
) {
    suspend fun login(email: String, password: String) = service.login(LoginRequest(email, password))

    suspend fun register(
        firstname: String,
        lastname: String,
        email: String,
        password: String,
    ) = service.register(RegisterRequest(firstname, lastname, email, password))

    suspend fun getStalls(): ApiResponse<List<StallDto>> {
        val token = sessionManager.bearerToken()
        return service.getStalls(token)
    }

    suspend fun getMyStalls(): ApiResponse<List<StallDto>> {
        val token = sessionManager.bearerToken() ?: throw IllegalStateException("Please sign in first.")
        return service.getMyStalls(token)
    }

    suspend fun createStall(request: StallRequest): ApiResponse<StallDto> {
        val token = sessionManager.bearerToken() ?: throw IllegalStateException("Please sign in first.")
        return service.createStall(token, request)
    }
}
