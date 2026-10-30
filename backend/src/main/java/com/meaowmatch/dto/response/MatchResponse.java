package com.meaowmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private UUID matchId;
    private UUID matchedUserId;
    private String matchedUserName;
    private String matchedUserRole;
    private PetResponse pet;
    private String matchType;
    private String lastMessage;
    private int unreadCount;
    private OffsetDateTime matchedAt;
}
