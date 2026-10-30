package com.meaowmatch.service;

import com.meaowmatch.dto.request.LoginRequest;
import com.meaowmatch.dto.request.RegisterRequest;
import com.meaowmatch.dto.response.AuthResponse;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.UserRepository;
import com.meaowmatch.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
            .id(UUID.randomUUID())
            .email("rescuer@meaowmatch.org")
            .passwordHash("encoded_pw")
            .role(User.UserRole.RESCUER)
            .fullName("Jane Doe")
            .status("ACTIVE")
            .build();
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest req = RegisterRequest.builder()
            .email("new@meaowmatch.org")
            .password("password123")
            .role(User.UserRole.ADOPTER)
            .fullName("John Smith")
            .build();

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(req.getPassword())).thenReturn("encoded_pw");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtTokenProvider.generateToken(any(), any())).thenReturn("mock_token");

        AuthResponse resp = authService.register(req);
        assertNotNull(resp);
        assertEquals("mock_token", resp.getToken());
        assertEquals("rescuer@meaowmatch.org", resp.getEmail());
    }

    @Test
    void testRegisterDuplicateEmailThrows() {
        RegisterRequest req = RegisterRequest.builder()
            .email("rescuer@meaowmatch.org")
            .password("password123")
            .build();

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest req = LoginRequest.builder()
            .email("rescuer@meaowmatch.org")
            .password("password123")
            .build();

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "encoded_pw")).thenReturn(true);
        when(jwtTokenProvider.generateToken(sampleUser.getId(), sampleUser.getEmail())).thenReturn("jwt_token");

        AuthResponse resp = authService.login(req);
        assertNotNull(resp);
        assertEquals("jwt_token", resp.getToken());
    }

    @Test
    void testLoginInvalidPasswordThrows() {
        LoginRequest req = LoginRequest.builder()
            .email("rescuer@meaowmatch.org")
            .password("wrong_password")
            .build();

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrong_password", "encoded_pw")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }
}
