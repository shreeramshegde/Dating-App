package com.datingapp.service;

import com.datingapp.dto.request.ChatMessageRequest;
import com.datingapp.dto.response.ChatMessageResponse;
import com.datingapp.entity.Match;
import com.datingapp.entity.Message;
import com.datingapp.repository.MatchRepository;
import com.datingapp.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final MatchRepository matchRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatMessageResponse sendMessage(UUID senderId, ChatMessageRequest request) {
        Match match = matchRepository.findById(request.getMatchId())
            .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        if (!match.getIsActive()) {
            throw new IllegalArgumentException("Cannot send message to an inactive match");
        }

        if (!match.getUser1Id().equals(senderId) && !match.getUser2Id().equals(senderId)) {
            throw new IllegalArgumentException("Unauthorized to send message to this match");
        }

        Message message = Message.builder()
            .matchId(match.getId())
            .senderId(senderId)
            .content(request.getContent().trim())
            .isRead(false)
            .build();

        message = messageRepository.save(message);

        ChatMessageResponse response = ChatMessageResponse.builder()
            .id(message.getId())
            .matchId(message.getMatchId())
            .senderId(message.getSenderId())
            .content(message.getContent())
            .isRead(message.getIsRead())
            .sentAt(message.getSentAt())
            .build();

        // Broadcast to WebSocket topic for this match
        messagingTemplate.convertAndSend("/topic/match." + match.getId(), response);

        return response;
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getMessages(UUID currentUserId, UUID matchId, int page, int size) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        if (!match.getUser1Id().equals(currentUserId) && !match.getUser2Id().equals(currentUserId)) {
            throw new IllegalArgumentException("Unauthorized to view this conversation");
        }

        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByMatchIdOrderBySentAtDesc(matchId, pageable)
            .map(m -> ChatMessageResponse.builder()
                .id(m.getId())
                .matchId(m.getMatchId())
                .senderId(m.getSenderId())
                .content(m.getContent())
                .isRead(m.getIsRead())
                .sentAt(m.getSentAt())
                .build());
    }
}
