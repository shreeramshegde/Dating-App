package com.datingapp.dto.response;

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
    private boolean isMatch;
    private UUID matchId;
    private DiscoveryCardDto matchedProfile;
}
