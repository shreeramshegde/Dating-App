package com.meaowmatch.controller;

import com.meaowmatch.dto.request.ChatMessageRequest;
import com.meaowmatch.dto.response.ChatMessageResponse;
import com.meaowmatch.entity.User;
import com.meaowmatch.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chat & Messaging", description = "REST and STOMP WebSocket endpoints for real-time adoption and rescue messaging")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/{matchId}/messages")
    @Operation(summary = "Get conversation history", description = "Retrieve paginated messages for an active match.")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
        @AuthenticationPrincipal User user,
        @PathVariable UUID matchId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        List<ChatMessageResponse> messages = chatService.getMessages(user.getId(), matchId, page, size);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{matchId}/messages")
    @Operation(summary = "Send chat message via REST", description = "Send a text message in an adoption/rescue conversation over REST.")
    public ResponseEntity<ChatMessageResponse> sendMessageRest(
        @AuthenticationPrincipal User user,
        @PathVariable UUID matchId,
        @Valid @RequestBody ChatMessageRequest request
    ) {
        ChatMessageResponse response = chatService.sendMessage(user.getId(), matchId, request.getContent());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{matchId}/read")
    @Operation(summary = "Mark messages as read", description = "Marks all unread incoming messages in a conversation as read.")
    public ResponseEntity<Map<String, String>> markAsRead(
        @AuthenticationPrincipal User user,
        @PathVariable UUID matchId
    ) {
        chatService.markAsRead(user.getId(), matchId);
        return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
    }

    /**
     * Real-time STOMP WebSocket message handler.
     * Clients publish to destination: /app/chat.sendMessage or /app/chat.send
     */
    @MessageMapping({"/chat.sendMessage", "/chat.send"})
    public void sendMessageWebSocket(@Payload ChatMessageRequest request, Principal principal) {
        if (principal == null) {
            log.warn("Unauthenticated WebSocket message rejected");
            return;
        }

        UUID senderId = UUID.fromString(principal.getName());
        chatService.sendMessage(senderId, request.getMatchId(), request.getContent());
    }
}
