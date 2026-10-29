package com.datingapp.controller;

import com.datingapp.dto.response.DiscoveryCardDto;
import com.datingapp.service.DiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/feed")
    public ResponseEntity<List<DiscoveryCardDto>> getFeed(
        @AuthenticationPrincipal UUID userId,
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(discoveryService.getDiscoveryDeck(userId, limit));
    }
}
