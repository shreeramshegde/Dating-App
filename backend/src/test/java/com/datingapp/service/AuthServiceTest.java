package com.datingapp.service;

import com.datingapp.dto.request.LoginRequest;
import com.datingapp.dto.request.RegisterRequest;
import com.datingapp.dto.response.AuthResponse;
import com.datingapp.entity.User;
import com.datingapp.repository.ProfileRepository;
import com.datingapp.repository.UserRepository;
import com.datingapp.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Should register new user successfully")
    void shouldRegisterNewUser() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("alex@example.com");
        request.setPassword("password123");

        UUID userId = UUID.randomUUID();
        User savedUser = User.builder()
            .id(userId)
            .email("alex@example.com")
            .passwordHash("hashedPass")
            .status("ACTIVE")
            .build();

        when(userRepository.existsByEmail("alex@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPass");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken(userId, "alex@example.com")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getEmail()).isEqualTo("alex@example.com");
        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.isProfileCompleted()).isFalse();

        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with duplicate email")
    void shouldFailWhenEmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should authenticate user with valid credentials")
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alex@example.com");
        request.setPassword("password123");

        UUID userId = UUID.randomUUID();
        User user = User.builder()
            .id(userId)
            .email("alex@example.com")
            .passwordHash("hashedPass")
            .build();

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPass")).thenReturn(true);
        when(profileRepository.existsById(userId)).thenReturn(true);
        when(jwtTokenProvider.generateToken(userId, "alex@example.com")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.isProfileCompleted()).isTrue();
    }

    @Test
    @DisplayName("Should fail login with wrong password")
    void shouldFailLoginWithWrongPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alex@example.com");
        request.setPassword("wrongPassword");

        User user = User.builder()
            .email("alex@example.com")
            .passwordHash("hashedPass")
            .build();

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPass")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid email or password");
    }
}
