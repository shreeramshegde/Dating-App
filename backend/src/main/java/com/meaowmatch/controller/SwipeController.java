package com.meaowmatch.controller;

import com.meaowmatch.dto.request.SwipeRequest;
import com.meaowmatch.dto.response.SwipeResponse;
import com.meaowmatch.entity.User;
import com.meaowmatch.service.SwipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/swipes")
@RequiredArgsConstructor
@Tag(name = "Adoption Swipes", description = "Endpoints for swiping on pets to express adoption interest")
public class SwipeController {

    private final SwipeService swipeService;

    @PostMapping
    @Operation(summary = "Submit adoption swipe", description = "Swipe LIKE (adopt interest) or PASS on a pet. If LIKE, an adoption match is created.")
    public ResponseEntity<SwipeResponse> swipe(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody SwipeRequest request
    ) {
        SwipeResponse response = swipeService.processSwipe(user.getId(), request.getPetId(), request.getType());
        return ResponseEntity.ok(response);
    }
}
