package com.datingapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class ChatMessageRequest {
    private UUID matchId;

    @NotBlank(message = "Content cannot be empty")
    private String content;
}
