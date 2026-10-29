package com.datingapp.controller;

import com.datingapp.dto.response.MatchResponse;
import com.datingapp.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getMyMatches(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(matchService.getMatchesForUser(userId));
    }

    @DeleteMapping("/{matchId}")
    public ResponseEntity<?> unmatch(
        @AuthenticationPrincipal UUID userId,
        @PathVariable UUID matchId
    ) {
        matchService.unmatch(userId, matchId);
        return ResponseEntity.ok(Map.of("message", "Unmatched successfully"));
    }
}
