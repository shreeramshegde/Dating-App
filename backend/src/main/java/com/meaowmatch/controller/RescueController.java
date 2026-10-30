package com.meaowmatch.controller;

import com.meaowmatch.dto.request.RescueReportRequest;
import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.entity.Match;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.User;
import com.meaowmatch.service.RescueService;
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
@RequestMapping("/api/v1/rescue-alerts")
@RequiredArgsConstructor
@Tag(name = "Rescue Alerts", description = "Endpoints for reporting injured/stray animals in distress and emergency coordination")
public class RescueController {

    private final RescueService rescueService;

    @PostMapping
    @Operation(summary = "Report an injured or stray animal", description = "Create an urgent rescue alert with photos and GPS coordinates for nearby rescue teams.")
    public ResponseEntity<PetResponse> reportRescue(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody RescueReportRequest request
    ) {
        PetResponse response = rescueService.createRescueAlert(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/nearby")
    @Operation(summary = "Get nearby emergency rescue alerts", description = "Discover urgent rescue alerts near a location, prioritized by CRITICAL urgency.")
    public ResponseEntity<List<PetResponse>> getNearbyAlerts(
        @RequestParam(required = false) Pet.Species species,
        @RequestParam(required = false, defaultValue = "0.0") Double latitude,
        @RequestParam(required = false, defaultValue = "0.0") Double longitude,
        @RequestParam(required = false, defaultValue = "50") Integer maxDistanceKm,
        @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        List<PetResponse> alerts = rescueService.getNearbyRescueAlerts(species, latitude, longitude, maxDistanceKm, limit);
        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/{id}/respond")
    @Operation(summary = "Respond to a rescue alert", description = "Volunteer or shelter claims the rescue alert, instantly opening a live chat with the reporter.")
    public ResponseEntity<Map<String, Object>> respondToAlert(
        @AuthenticationPrincipal User user,
        @PathVariable UUID id
    ) {
        Match match = rescueService.respondToRescueAlert(user.getId(), id);
        return ResponseEntity.ok(Map.of(
            "matchId", match.getId(),
            "message", "Successfully claimed rescue alert. Live coordination chat opened!"
        ));
    }
}
