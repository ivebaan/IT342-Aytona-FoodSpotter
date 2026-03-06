package edu.cit.aytona.foodspotter.service;

import edu.cit.aytona.foodspotter.dto.AuthData;
import edu.cit.aytona.foodspotter.dto.LoginRequest;
import edu.cit.aytona.foodspotter.dto.RegisterRequest;
import edu.cit.aytona.foodspotter.dto.UserDTO;
import edu.cit.aytona.foodspotter.entity.User;
import edu.cit.aytona.foodspotter.repository.UserRepository;
import edu.cit.aytona.foodspotter.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthData register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Build and save user with hashed password
        User user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthData.builder()
                .user(toDTO(user))
                .accessToken(token)
                .build();
    }

    public AuthData login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthData.builder()
                .user(toDTO(user))
                .accessToken(token)
                .build();
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .email(user.getEmail())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .role(user.getRole().name())
                .build();
    }
}
