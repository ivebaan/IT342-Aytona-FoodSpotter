package edu.cit.aytona.foodspotter.controller;

import edu.cit.aytona.foodspotter.dto.ApiResponse;
import edu.cit.aytona.foodspotter.dto.StallDTO;
import edu.cit.aytona.foodspotter.dto.StallRequest;
import edu.cit.aytona.foodspotter.service.StallService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
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
        List<StallDTO> stalls = stallService.getApprovedStalls();
        return ResponseEntity.ok(ApiResponse.ok(stalls));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StallDTO>> getStall(@PathVariable Long id) {
        StallDTO stall = stallService.getStall(id);
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

    @DeleteMapping("/admin/stalls/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStall(@PathVariable Long id) {
        stallService.deleteStall(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
