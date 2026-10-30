package com.meaowmatch.service;

import com.meaowmatch.dto.response.MatchResponse;
import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.entity.Match;
import com.meaowmatch.entity.Message;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.MatchRepository;
import com.meaowmatch.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final MessageRepository messageRepository;
    private final PetService petService;

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesForUser(UUID userId) {
        List<Match> matches = matchRepository.findActiveMatchesByUserId(userId);

        return matches.stream().map(m -> {
            User partner = m.getUser1().getId().equals(userId) ? m.getUser2() : m.getUser1();
            Optional<Message> latestMsg = messageRepository.findLatestMessage(m.getId());
            int unreadCount = messageRepository.countUnreadMessages(m.getId(), userId);

            PetResponse petResponse = m.getPet() != null ? petService.mapToResponse(m.getPet(), null) : null;

            return MatchResponse.builder()
                .matchId(m.getId())
                .matchedUserId(partner.getId())
                .matchedUserName(partner.getFullName() != null ? partner.getFullName() : partner.getEmail())
                .matchedUserRole(partner.getRole() != null ? partner.getRole().name() : "USER")
                .pet(petResponse)
                .matchType(m.getMatchType())
                .lastMessage(latestMsg.map(Message::getContent).orElse("No messages yet. Say hello!"))
                .unreadCount(unreadCount)
                .matchedAt(m.getMatchedAt())
                .build();
        }).toList();
    }

    @Transactional
    public void unmatch(UUID currentUserId, UUID matchId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        if (!match.getUser1().getId().equals(currentUserId) && !match.getUser2().getId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to modify this match");
        }

        match.setIsActive(false);
        matchRepository.save(match);
    }
}
