package edu.cit.aytona.foodspotter.features.users.controller;

import edu.cit.aytona.foodspotter.dto.ApiResponse;
import edu.cit.aytona.foodspotter.features.auth.dto.UserDTO;
import edu.cit.aytona.foodspotter.features.users.application.UserService;
import edu.cit.aytona.foodspotter.features.users.dto.RoleUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> me(@AuthenticationPrincipal UserDetails userDetails) {
        requireAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUser(userDetails.getUsername())));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMe(@AuthenticationPrincipal UserDetails userDetails) {
        requireAuthenticatedUser(userDetails);
        userService.deleteMyAccount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        requireAuthenticatedUser(userDetails);
        userService.deleteAccount(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PatchMapping("/{id:\\d+}/role")
    public ResponseEntity<ApiResponse<UserDTO>> updateRole(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {
        requireAuthenticatedUser(userDetails);
        UserDTO updated = userService.updateRole(userDetails.getUsername(), id, request);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.ok(updated));
    }

    private void requireAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
    }
}