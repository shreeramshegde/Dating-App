package com.datingapp.controller;

import com.datingapp.dto.request.ProfileUpdateRequest;
import com.datingapp.dto.response.PhotoDto;
import com.datingapp.dto.response.PresignedUploadResponse;
import com.datingapp.dto.response.ProfileResponse;
import com.datingapp.service.ProfileService;
import com.datingapp.service.S3StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final S3StorageService s3StorageService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
        @AuthenticationPrincipal UUID userId,
        @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(profileService.upsertProfile(userId, request));
    }

    @PostMapping("/photos/presign")
    public ResponseEntity<PresignedUploadResponse> getPresignedPhotoUploadUrl(
        @AuthenticationPrincipal UUID userId,
        @RequestParam(defaultValue = "image/jpeg") String contentType
    ) {
        return ResponseEntity.ok(s3StorageService.generatePresignedUploadUrl(userId, contentType));
    }

    @PostMapping("/photos")
    public ResponseEntity<PhotoDto> addPhoto(
        @AuthenticationPrincipal UUID userId,
        @RequestBody Map<String, Object> payload
    ) {
        String photoUrl = (String) payload.get("photoUrl");
        Boolean isPrimary = (Boolean) payload.getOrDefault("isPrimary", false);

        if (photoUrl == null || photoUrl.isBlank()) {
            throw new IllegalArgumentException("photoUrl is required");
        }

        return ResponseEntity.ok(profileService.addPhoto(userId, photoUrl, isPrimary));
    }

    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<?> deletePhoto(
        @AuthenticationPrincipal UUID userId,
        @PathVariable UUID photoId
    ) {
        profileService.deletePhoto(userId, photoId);
        return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
    }
}
