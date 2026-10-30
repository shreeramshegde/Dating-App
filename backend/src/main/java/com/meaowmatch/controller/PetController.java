package com.meaowmatch.controller;

import com.meaowmatch.dto.request.PetCreateRequest;
import com.meaowmatch.dto.request.PetUpdateRequest;
import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.dto.response.PresignedUploadResponse;
import com.meaowmatch.entity.User;
import com.meaowmatch.service.PetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pets")
@RequiredArgsConstructor
@Tag(name = "Pets", description = "Endpoints for managing pet listings, adoption profiles, and S3 photos")
public class PetController {

    private final PetService petService;

    @PostMapping
    @Operation(summary = "Create pet listing", description = "Post a pet for adoption, foster care, or rescue.")
    public ResponseEntity<PetResponse> createPet(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody PetCreateRequest request
    ) {
        PetResponse response = petService.createPet(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get pet details", description = "Retrieve full pet details by Pet ID.")
    public ResponseEntity<PetResponse> getPetById(@PathVariable UUID id) {
        PetResponse response = petService.getPetById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update pet listing", description = "Update details, photos, or status of a pet owned by current user.")
    public ResponseEntity<PetResponse> updatePet(
        @AuthenticationPrincipal User user,
        @PathVariable UUID id,
        @RequestBody PetUpdateRequest request
    ) {
        PetResponse response = petService.updatePet(user.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete pet listing", description = "Remove a pet listing and delete associated S3 photos.")
    public ResponseEntity<Map<String, String>> deletePet(
        @AuthenticationPrincipal User user,
        @PathVariable UUID id
    ) {
        petService.deletePet(user.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Pet listing deleted successfully"));
    }

    @GetMapping({"/my", "/my-pets"})
    @Operation(summary = "List pets posted by me", description = "Get all pets listed by the logged-in rehomer or rescuer.")
    public ResponseEntity<List<PetResponse>> getMyPets(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<PetResponse> myPets = petService.getMyPets(user.getId());
        return ResponseEntity.ok(myPets);
    }

    @PostMapping({"/photos/presign", "/photos/presigned"})
    @Operation(summary = "Request S3 Pre-signed Upload URL", description = "Generates a pre-signed S3 PUT URL for direct photo uploads.")
    public ResponseEntity<PresignedUploadResponse> presignPhoto(
        @AuthenticationPrincipal User user,
        @RequestParam(defaultValue = "image/jpeg") String contentType
    ) {
        PresignedUploadResponse response = petService.generatePresignedUploadUrl(user.getId(), contentType);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/photos")
    @Operation(summary = "Add photo to pet", description = "Attach an uploaded S3 photo to an existing pet listing.")
    public ResponseEntity<com.meaowmatch.dto.response.PhotoDto> addPhoto(
        @AuthenticationPrincipal User user,
        @PathVariable UUID id,
        @RequestBody Map<String, Object> body
    ) {
        String photoUrl = (String) body.get("photoUrl");
        Integer displayOrder = body.get("displayOrder") != null ? ((Number) body.get("displayOrder")).intValue() : null;
        Boolean isPrimary = (Boolean) body.get("isPrimary");

        com.meaowmatch.dto.response.PhotoDto photoDto = petService.addPhotoToPet(
            user.getId(), id, photoUrl, displayOrder, isPrimary
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(photoDto);
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    @Operation(summary = "Delete photo from pet", description = "Removes a photo from a pet and deletes it from S3.")
    public ResponseEntity<Map<String, String>> deletePhoto(
        @AuthenticationPrincipal User user,
        @PathVariable UUID id,
        @PathVariable UUID photoId
    ) {
        petService.deletePhotoFromPet(user.getId(), id, photoId);
        return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
    }
}
