package edu.cit.aytona.foodspotter.features.auth.application;

import edu.cit.aytona.foodspotter.features.auth.dto.AuthData;
import edu.cit.aytona.foodspotter.features.auth.dto.LoginRequest;
import edu.cit.aytona.foodspotter.features.auth.dto.RegisterRequest;
import edu.cit.aytona.foodspotter.features.auth.model.User;
import edu.cit.aytona.foodspotter.features.auth.repository.UserRepository;
import edu.cit.aytona.foodspotter.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setFirstname("John");
        req.setLastname("Doe");
        req.setEmail("john@example.com");
        req.setPassword("password123");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(jwtUtil.generateToken(req.getEmail())).thenReturn("token123");

        AuthData data = authService.register(req);

        assertNotNull(data);
        assertEquals("token123", data.getAccessToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void login_invalid_throws() {
        LoginRequest req = new LoginRequest();
        req.setEmail("noone@example.com");
        req.setPassword("pw");

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> authService.login(req));
    }
}
