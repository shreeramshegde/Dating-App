package com.meaowmatch.controller;

import com.meaowmatch.dto.request.LoginRequest;
import com.meaowmatch.dto.request.ProfileUpdateRequest;
import com.meaowmatch.dto.request.RegisterRequest;
import com.meaowmatch.dto.response.AuthResponse;
import com.meaowmatch.dto.response.UserProfileResponse;
import com.meaowmatch.entity.User;
import com.meaowmatch.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, and profile management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create an account as an ADOPTER, REHOMER, or RESCUER and receive a JWT token.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password", description = "Authenticate credentials and obtain a JWT token.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Retrieve profile and role information for the authenticated user.")
    public ResponseEntity<UserProfileResponse> getCurrentProfile(@AuthenticationPrincipal User user) {
        UserProfileResponse response = authService.getProfile(user.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping({"/me", "/profile"})
    @Operation(summary = "Update current user profile", description = "Update name, phone, city, or coordinates for the authenticated user.")
    public ResponseEntity<UserProfileResponse> updateProfile(
        @AuthenticationPrincipal User user,
        @RequestBody ProfileUpdateRequest request
    ) {
        UserProfileResponse response = authService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(response);
    }
}
