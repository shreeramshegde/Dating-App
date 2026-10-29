package com.datingapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SwipeRequest {
    @NotNull(message = "Target user ID is required")
    private UUID targetUserId;

    @NotBlank(message = "Swipe type must be LIKE or PASS")
    private String swipeType; // LIKE or PASS
}
