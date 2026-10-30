package com.meaowmatch.service;

import com.meaowmatch.dto.request.ChatMessageRequest;
import com.meaowmatch.dto.response.ChatMessageResponse;
import com.meaowmatch.entity.Match;
import com.meaowmatch.entity.Message;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.MatchRepository;
import com.meaowmatch.repository.MessageRepository;
import com.meaowmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MessageRepository messageRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public ChatMessageResponse sendMessage(UUID senderId, UUID matchId, String content) {
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        if (!match.getIsActive()) {
            throw new IllegalStateException("Conversation is closed");
        }

        boolean isParticipant = match.getUser1().getId().equals(senderId) || match.getUser2().getId().equals(senderId);
        if (!isParticipant) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to participate in this match");
        }

        Message message = Message.builder()
            .match(match)
            .sender(sender)
            .content(content)
            .isRead(false)
            .build();

        Message savedMessage = messageRepository.save(message);

        // Update match's updated_at timestamp
        match.setUpdatedAt(OffsetDateTime.now());
        matchRepository.save(match);

        ChatMessageResponse response = mapToResponse(savedMessage);

        // Broadcast to WebSocket subscribers for this match topic (support both singular and plural)
        messagingTemplate.convertAndSend("/topic/match." + matchId, response);
        messagingTemplate.convertAndSend("/topic/matches." + matchId, response);

        log.info("Message sent in match {}: sender={}", matchId, senderId);
        return response;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID currentUserId, UUID matchId, int page, int size) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        boolean isParticipant = match.getUser1().getId().equals(currentUserId) || match.getUser2().getId().equals(currentUserId);
        if (!isParticipant) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view this conversation");
        }

        List<Message> messages = messageRepository.findByMatchIdOrderBySentAtDesc(
            matchId, PageRequest.of(page, size)
        );

        return messages.stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public void markAsRead(UUID currentUserId, UUID matchId) {
        List<Message> unread = messageRepository.findByMatchIdOrderBySentAtAsc(matchId)
            .stream()
            .filter(m -> !m.getSender().getId().equals(currentUserId) && !m.getIsRead())
            .toList();

        unread.forEach(m -> m.setIsRead(true));
        messageRepository.saveAll(unread);
    }

    private ChatMessageResponse mapToResponse(Message message) {
        return ChatMessageResponse.builder()
            .id(message.getId())
            .matchId(message.getMatch().getId())
            .senderId(message.getSender().getId())
            .senderName(message.getSender().getFullName() != null ? message.getSender().getFullName() : message.getSender().getEmail())
            .content(message.getContent())
            .isRead(message.getIsRead())
            .sentAt(message.getSentAt())
            .build();
    }
}
