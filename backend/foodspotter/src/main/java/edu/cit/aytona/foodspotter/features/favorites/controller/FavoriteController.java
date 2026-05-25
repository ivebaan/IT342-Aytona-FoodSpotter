package edu.cit.aytona.foodspotter.features.favorites.controller;

import edu.cit.aytona.foodspotter.dto.ApiResponse;
import edu.cit.aytona.foodspotter.features.favorites.application.FavoriteService;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/{stallId:\\d+}")
    public ResponseEntity<ApiResponse<StallDTO>> addFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long stallId) {
        StallDTO stall = favoriteService.addFavorite(userDetails.getUsername(), stallId);
        return ResponseEntity.ok(ApiResponse.ok(stall));
    }

    @DeleteMapping("/{stallId:\\d+}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long stallId) {
        favoriteService.removeFavorite(userDetails.getUsername(), stallId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StallDTO>>> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(favoriteService.getFavorites(userDetails.getUsername())));
    }
}