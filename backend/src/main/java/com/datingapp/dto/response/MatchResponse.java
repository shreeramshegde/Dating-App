package com.datingapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private UUID matchId;
    private UUID targetUserId;
    private String targetFirstName;
    private String targetPhotoUrl;
    private String lastMessage;
    private Instant lastMessageTime;
    private long unreadCount;
    private Instant matchedAt;
}
