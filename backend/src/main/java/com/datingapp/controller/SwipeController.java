package com.datingapp.controller;

import com.datingapp.dto.request.SwipeRequest;
import com.datingapp.dto.response.SwipeResponse;
import com.datingapp.service.SwipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/swipes")
@RequiredArgsConstructor
public class SwipeController {

    private final SwipeService swipeService;

    @PostMapping
    public ResponseEntity<SwipeResponse> swipe(
        @AuthenticationPrincipal UUID userId,
        @Valid @RequestBody SwipeRequest request
    ) {
        return ResponseEntity.ok(swipeService.processSwipe(userId, request));
    }
}
