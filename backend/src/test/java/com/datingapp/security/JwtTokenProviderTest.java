package com.datingapp.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "dGhpcy1pcy1hLXZlcnktc3Ryb25nLXNlY3JldC1rZXktZm9yLWRhdGluZy1hcHAtbXZwLTIwMjYtc3ByaW5nLWJvb3Q=";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, 3600000); // 1 hour
    }

    @Test
    @DisplayName("Should generate valid JWT token containing user ID")
    void shouldGenerateAndValidateToken() {
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";

        String token = jwtTokenProvider.generateToken(userId, email);

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(userId);
    }

    @Test
    @DisplayName("Should reject invalid or tampered JWT token")
    void shouldRejectInvalidToken() {
        String invalidToken = "eyJhbGciOiJIUzUxMiJ9.invalid.payload";

        assertThat(jwtTokenProvider.validateToken(invalidToken)).isFalse();
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
        assertThat(jwtTokenProvider.validateToken(null)).isFalse();
    }
}
