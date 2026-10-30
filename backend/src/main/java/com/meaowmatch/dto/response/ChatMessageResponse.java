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
public class ChatMessageResponse {
    private UUID id;
    private UUID matchId;
    private UUID senderId;
    private String senderName;
    private String content;
    private boolean isRead;
    private OffsetDateTime sentAt;
}
