package com.meaowmatch.controller;

import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.User;
import com.meaowmatch.service.DiscoveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/discovery")
@RequiredArgsConstructor
@Tag(name = "Discovery", description = "Endpoints for discovering nearby pets for adoption or foster")
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/pets")
    @Operation(summary = "Get adoption discovery feed", description = "Discover pets nearby, filtered by species and maximum distance (km). Supports guests and authenticated adopters.")
    public ResponseEntity<List<PetResponse>> getDiscoveryFeed(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false) Pet.Species species,
        @RequestParam(required = false) Pet.ListingType listingType,
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude,
        @RequestParam(required = false, defaultValue = "50") Integer maxDistanceKm,
        @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        UUID currentUserId = user != null ? user.getId() : null;
        List<PetResponse> feed = discoveryService.getDiscoveryFeed(
            currentUserId,
            species,
            listingType,
            latitude,
            longitude,
            maxDistanceKm,
            limit
        );
        return ResponseEntity.ok(feed);
    }
}
