package com.meaowmatch.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.s3.S3Client;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "System", description = "Root and Health check endpoints")
public class RootAndHealthController {

    private final DataSource dataSource;
    private final S3Client s3Client;

    @GetMapping("/")
    @Operation(summary = "Welcome to MeaowMatch API", description = "Provides root service status, API version, and link to Swagger documentation.")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "application", "MeaowMatch Backend API",
            "version", "1.0.0",
            "status", "ONLINE",
            "description", "Pet Adoption & Emergency Animal Rescue Platform",
            "documentation", "/swagger-ui/index.html",
            "endpoints", Map.of(
                "auth", "/api/v1/auth",
                "pets", "/api/v1/pets",
                "discovery", "/api/v1/discovery/pets",
                "rescueAlerts", "/api/v1/rescue-alerts",
                "swipes", "/api/v1/swipes",
                "matches", "/api/v1/matches",
                "webSocket", "/ws"
            )
        ));
    }

    @GetMapping("/health")
    @Operation(summary = "Service Health Check", description = "Verifies active database and S3 connections.")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        boolean isHealthy = true;

        // Check Database connectivity
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                status.put("database", "CONNECTED");
            } else {
                status.put("database", "UNHEALTHY");
                isHealthy = false;
            }
        } catch (Exception e) {
            log.error("Health check failed on Database connection: {}", e.getMessage());
            status.put("database", "DISCONNECTED: " + e.getMessage());
            isHealthy = false;
        }

        // Check S3 Object Storage connectivity
        try {
            s3Client.listBuckets();
            status.put("storage", "CONNECTED");
        } catch (Exception e) {
            log.error("Health check failed on S3 connection: {}", e.getMessage());
            status.put("storage", "DISCONNECTED: " + e.getMessage());
            isHealthy = false;
        }

        status.put("status", isHealthy ? "UP" : "DOWN");

        return ResponseEntity
            .status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
            .body(status);
    }
}
