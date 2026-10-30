package com.meaowmatch.service;

import com.meaowmatch.dto.request.LoginRequest;
import com.meaowmatch.dto.request.ProfileUpdateRequest;
import com.meaowmatch.dto.request.RegisterRequest;
import com.meaowmatch.dto.response.AuthResponse;
import com.meaowmatch.dto.response.UserProfileResponse;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.UserRepository;
import com.meaowmatch.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole() != null ? request.getRole() : User.UserRole.ADOPTER)
            .fullName(request.getFullName())
            .phone(request.getPhone())
            .city(request.getCity())
            .latitude(request.getLatitude() != null ? request.getLatitude() : 0.0)
            .longitude(request.getLongitude() != null ? request.getLongitude() : 0.0)
            .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .role(user.getRole())
            .fullName(user.getFullName())
            .profileCompleted(user.getFullName() != null && !user.getFullName().isBlank())
            .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .role(user.getRole())
            .fullName(user.getFullName())
            .profileCompleted(user.getFullName() != null && !user.getFullName().isBlank())
            .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return UserProfileResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .role(user.getRole())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .city(user.getCity())
            .latitude(user.getLatitude())
            .longitude(user.getLongitude())
            .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getLatitude() != null) user.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) user.setLongitude(request.getLongitude());
        if (request.getRole() != null) user.setRole(request.getRole());

        user = userRepository.save(user);

        return getProfile(user.getId());
    }
}
