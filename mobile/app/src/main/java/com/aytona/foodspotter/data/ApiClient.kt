package com.aytona.foodspotter.data

import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private const val BASE_URL = "http://10.0.2.2:8081/"

    private val okHttpClient = OkHttpClient.Builder().build()

    private val gson = GsonBuilder()
        .serializeNulls()
        .create()

    val service: FoodSpotterApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(FoodSpotterApiService::class.java)
    }
}
