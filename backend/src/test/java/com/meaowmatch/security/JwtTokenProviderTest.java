package com.meaowmatch.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "dGhpcy1pcy1hLXZlcnktc3Ryb25nLXNlY3JldC1rZXktZm9yLWRhdGluZy1hcHAtbXZwLTIwMjYtc3ByaW5nLWJvb3Q=";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, 86400000L);
    }

    @Test
    void testGenerateAndValidateToken() {
        UUID userId = UUID.randomUUID();
        String email = "catlover@example.com";

        String token = jwtTokenProvider.generateToken(userId, email);
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
    }
}
