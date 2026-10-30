package com.meaowmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwipeResponse {
    private boolean match;
    private UUID matchId;
    private PetResponse matchedPet;
    private String message;
}
