package com.datingapp.controller;

import com.datingapp.dto.request.ChatMessageRequest;
import com.datingapp.dto.response.ChatMessageResponse;
import com.datingapp.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/api/v1/matches/{matchId}/messages")
    public ResponseEntity<Page<ChatMessageResponse>> getMessages(
        @AuthenticationPrincipal UUID userId,
        @PathVariable UUID matchId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(chatService.getMessages(userId, matchId, page, size));
    }

    @PostMapping("/api/v1/matches/{matchId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessageRest(
        @AuthenticationPrincipal UUID userId,
        @PathVariable UUID matchId,
        @Valid @RequestBody ChatMessageRequest request
    ) {
        request.setMatchId(matchId);
        return ResponseEntity.ok(chatService.sendMessage(userId, request));
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessageWebSocket(@Payload ChatMessageRequest request, Principal principal) {
        if (principal != null) {
            UUID senderId = UUID.fromString(principal.getName());
            chatService.sendMessage(senderId, request);
        }
    }
}
