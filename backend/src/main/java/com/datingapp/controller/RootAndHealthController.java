package com.datingapp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "System", description = "Root discovery and system health endpoints")
public class RootAndHealthController {

    private final DataSource dataSource;

    @GetMapping("/")
    @Operation(summary = "Root entrypoint", description = "Provides welcome guide and link to Swagger documentation")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "Dating App MVP Backend");
        response.put("status", "ONLINE");
        response.put("message", "Welcome! To explore and test the REST APIs, visit the interactive Swagger UI.");
        response.put("swagger_ui", "/swagger-ui/index.html");
        response.put("api_docs", "/v3/api-docs");
        response.put("health_check", "/health");
        response.put("timestamp", Instant.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Verifies server and database connectivity")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now());

        // Check database connectivity
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            health.put("database", valid ? "CONNECTED (NeonDB PostgreSQL)" : "DISCONNECTED");
        } catch (Exception e) {
            health.put("database", "ERROR: " + e.getMessage());
            health.put("status", "DOWN");
            return ResponseEntity.status(503).body(health);
        }

        return ResponseEntity.ok(health);
    }
}
