package com.meaowmatch.dto.request;

import com.meaowmatch.entity.Swipe;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwipeRequest {

    @NotNull(message = "Pet ID is required")
    private UUID petId;

    @NotNull(message = "Swipe type is required (LIKE or PASS)")
    private Swipe.SwipeType type;
}
