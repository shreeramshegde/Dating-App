package com.datingapp.service;

import com.datingapp.dto.response.MatchResponse;
import com.datingapp.entity.Match;
import com.datingapp.entity.Message;
import com.datingapp.entity.Profile;
import com.datingapp.repository.MatchRepository;
import com.datingapp.repository.MessageRepository;
import com.datingapp.repository.ProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private MatchService matchService;

    @Test
    @DisplayName("Should fetch active matches with last message preview")
    void shouldGetMatchesForUser() {
        UUID currentUserId = UUID.randomUUID();
        UUID partnerId = UUID.randomUUID();
        UUID matchId = UUID.randomUUID();

        Match match = Match.builder()
            .id(matchId)
            .user1Id(currentUserId)
            .user2Id(partnerId)
            .isActive(true)
            .matchedAt(Instant.now())
            .build();

        Profile partnerProfile = Profile.builder()
            .userId(partnerId)
            .firstName("Sophia")
            .photos(Collections.emptyList())
            .build();

        Message lastMessage = Message.builder()
            .content("Hey there!")
            .sentAt(Instant.now())
            .build();

        when(matchRepository.findActiveMatchesForUser(currentUserId)).thenReturn(List.of(match));
        when(profileRepository.findById(partnerId)).thenReturn(Optional.of(partnerProfile));
        when(messageRepository.findFirstByMatchIdOrderBySentAtDesc(matchId)).thenReturn(Optional.of(lastMessage));
        when(messageRepository.countByMatchIdAndSenderIdNotAndIsReadFalse(matchId, currentUserId)).thenReturn(1L);

        List<MatchResponse> matches = matchService.getMatchesForUser(currentUserId);

        assertThat(matches).hasSize(1);
        MatchResponse response = matches.get(0);
        assertThat(response.getMatchId()).isEqualTo(matchId);
        assertThat(response.getTargetFirstName()).isEqualTo("Sophia");
        assertThat(response.getLastMessage()).isEqualTo("Hey there!");
        assertThat(response.getUnreadCount()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should successfully deactivate match on unmatch")
    void shouldUnmatchUser() {
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();
        UUID matchId = UUID.randomUUID();

        Match match = Match.builder()
            .id(matchId)
            .user1Id(user1)
            .user2Id(user2)
            .isActive(true)
            .build();

        when(matchRepository.findById(matchId)).thenReturn(Optional.of(match));

        matchService.unmatch(user1, matchId);

        assertThat(match.getIsActive()).isFalse();
        verify(matchRepository).save(match);
    }

    @Test
    @DisplayName("Should reject unmatch attempt by non-participant")
    void shouldPreventUnauthorizedUnmatch() {
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();
        UUID intruder = UUID.randomUUID();
        UUID matchId = UUID.randomUUID();

        Match match = Match.builder()
            .id(matchId)
            .user1Id(user1)
            .user2Id(user2)
            .isActive(true)
            .build();

        when(matchRepository.findById(matchId)).thenReturn(Optional.of(match));

        assertThatThrownBy(() -> matchService.unmatch(intruder, matchId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Unauthorized to modify this match");

        verify(matchRepository, never()).save(any());
    }
}
