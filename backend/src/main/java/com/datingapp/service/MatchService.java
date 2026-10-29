package com.datingapp.service;

import com.datingapp.dto.response.MatchResponse;
import com.datingapp.entity.Match;
import com.datingapp.entity.Message;
import com.datingapp.entity.Profile;
import com.datingapp.entity.ProfilePhoto;
import com.datingapp.repository.MatchRepository;
import com.datingapp.repository.MessageRepository;
import com.datingapp.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final ProfileRepository profileRepository;
    private final MessageRepository messageRepository;

    @Transactional(readOnly = true)
    public List<MatchResponse> getMatchesForUser(UUID currentUserId) {
        List<Match> matches = matchRepository.findActiveMatchesForUser(currentUserId);
        List<MatchResponse> responses = new ArrayList<>();

        for (Match match : matches) {
            UUID targetId = match.getUser1Id().equals(currentUserId) ? match.getUser2Id() : match.getUser1Id();

            Optional<Profile> targetProfileOpt = profileRepository.findById(targetId);
            if (targetProfileOpt.isEmpty()) continue;

            Profile targetProfile = targetProfileOpt.get();
            String photoUrl = targetProfile.getPhotos().stream()
                .filter(ProfilePhoto::getIsPrimary)
                .map(ProfilePhoto::getPhotoUrl)
                .findFirst()
                .orElse(targetProfile.getPhotos().isEmpty() ? null : targetProfile.getPhotos().get(0).getPhotoUrl());

            Optional<Message> lastMessageOpt = messageRepository.findFirstByMatchIdOrderBySentAtDesc(match.getId());
            long unread = messageRepository.countByMatchIdAndSenderIdNotAndIsReadFalse(match.getId(), currentUserId);

            responses.add(MatchResponse.builder()
                .matchId(match.getId())
                .targetUserId(targetId)
                .targetFirstName(targetProfile.getFirstName())
                .targetPhotoUrl(photoUrl)
                .lastMessage(lastMessageOpt.map(Message::getContent).orElse(null))
                .lastMessageTime(lastMessageOpt.map(Message::getSentAt).orElse(null))
                .unreadCount(unread)
                .matchedAt(match.getMatchedAt())
                .build());
        }

        return responses;
    }

    @Transactional
    public void unmatch(UUID currentUserId, UUID matchId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("Match not found"));

        if (!match.getUser1Id().equals(currentUserId) && !match.getUser2Id().equals(currentUserId)) {
            throw new IllegalArgumentException("Unauthorized to modify this match");
        }

        match.setIsActive(false);
        matchRepository.save(match);
    }
}
