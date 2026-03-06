package edu.cit.aytona.foodspotter.controller;

import edu.cit.aytona.foodspotter.dto.ApiResponse;
import edu.cit.aytona.foodspotter.dto.AuthData;
import edu.cit.aytona.foodspotter.dto.LoginRequest;
import edu.cit.aytona.foodspotter.dto.RegisterRequest;
import edu.cit.aytona.foodspotter.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthData>> register(@Valid @RequestBody RegisterRequest request) {
        AuthData data = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthData>> login(@Valid @RequestBody LoginRequest request) {
        AuthData data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
