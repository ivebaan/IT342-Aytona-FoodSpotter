package edu.cit.aytona.foodspotter.features.stalls.controller;

import edu.cit.aytona.foodspotter.dto.ApiResponse;
import edu.cit.aytona.foodspotter.features.stalls.application.StallService;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallDTO;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallRequest;
import edu.cit.aytona.foodspotter.features.stalls.dto.StallUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stalls")
@RequiredArgsConstructor
public class StallController {

    private final StallService stallService;

    @PostMapping
    public ResponseEntity<ApiResponse<StallDTO>> createStall(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StallRequest request) {

        StallDTO stall = stallService.createStall(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(stall));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StallDTO>>> getStalls() {
        List<StallDTO> stalls = stallService.getAllStallsDTO();
        return ResponseEntity.ok(ApiResponse.ok(stalls));
    }

    @GetMapping({"/me", "/mine"})
    public ResponseEntity<ApiResponse<List<StallDTO>>> getMyStalls(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String email = userDetails == null ? null : userDetails.getUsername();
        List<StallDTO> stalls = email == null ? java.util.List.of() : stallService.getStallsByOwnerEmail(email);
        return ResponseEntity.ok(ApiResponse.ok(stalls));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<StallDTO>> getStall(@PathVariable Long id) {
        StallDTO stall = stallService.getStall(id);
        return ResponseEntity.ok(ApiResponse.ok(stall));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<StallDTO>> updateStall(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody StallUpdateRequest request) {

        StallDTO stall = stallService.updateStall(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.ok(stall));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<StallDTO>>> filterStalls(@RequestParam(required = false) String cuisine) {
        List<StallDTO> stalls = stallService.filterByCuisine(cuisine);
        return ResponseEntity.ok(ApiResponse.ok(stalls));
    }

    @GetMapping("/admin/pending-stalls")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StallDTO>>> getPendingStalls() {
        List<StallDTO> stalls = stallService.getPendingStalls();
        return ResponseEntity.ok(ApiResponse.ok(stalls));
    }

    @PutMapping("/admin/stalls/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StallDTO>> approveStall(@PathVariable Long id) {
        StallDTO stall = stallService.approveStall(id);
        return ResponseEntity.ok(ApiResponse.ok(stall));
    }

    @PutMapping("/admin/stalls/{id}/clear-menu")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StallDTO>> clearMenu(@PathVariable Long id) {
        StallDTO stall = stallService.clearMenu(id);
        return ResponseEntity.ok(ApiResponse.ok(stall));
    }

    @DeleteMapping("/admin/stalls/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStall(@PathVariable Long id) {
        stallService.deleteStall(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
