package com.meaowmatch.controller;

import com.meaowmatch.dto.response.MatchResponse;
import com.meaowmatch.entity.User;
import com.meaowmatch.service.MatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Matches & Inquiries", description = "Endpoints for managing adoption inquiries and active conversations")
public class MatchController {

    private final MatchService matchService;

    @GetMapping
    @Operation(summary = "Get active matches and conversations", description = "List all active adoption or rescue chats for the authenticated user.")
    public ResponseEntity<List<MatchResponse>> getMatches(@AuthenticationPrincipal User user) {
        List<MatchResponse> matches = matchService.getMatchesForUser(user.getId());
        return ResponseEntity.ok(matches);
    }

    @DeleteMapping("/{matchId}")
    @Operation(summary = "Close conversation", description = "Deactivates an active match / inquiry thread.")
    public ResponseEntity<Map<String, String>> unmatch(
        @AuthenticationPrincipal User user,
        @PathVariable UUID matchId
    ) {
        matchService.unmatch(user.getId(), matchId);
        return ResponseEntity.ok(Map.of("message", "Conversation closed successfully"));
    }
}
