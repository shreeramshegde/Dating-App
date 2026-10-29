package com.datingapp.service;

import com.datingapp.dto.request.SwipeRequest;
import com.datingapp.dto.response.SwipeResponse;
import com.datingapp.entity.Match;
import com.datingapp.entity.Profile;
import com.datingapp.entity.Swipe;
import com.datingapp.repository.MatchRepository;
import com.datingapp.repository.ProfileRepository;
import com.datingapp.repository.SwipeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SwipeServiceTest {

    @Mock
    private SwipeRepository swipeRepository;

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private SwipeService swipeService;

    @Test
    @DisplayName("Should prevent user from swiping on themselves")
    void shouldPreventSelfSwiping() {
        UUID userId = UUID.randomUUID();
        SwipeRequest request = new SwipeRequest();
        request.setTargetUserId(userId);
        request.setSwipeType("LIKE");

        assertThatThrownBy(() -> swipeService.processSwipe(userId, request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Cannot swipe on yourself");
    }

    @Test
    @DisplayName("Should return no match when user performs PASS swipe")
    void shouldHandlePassSwipe() {
        UUID swiperId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();

        SwipeRequest request = new SwipeRequest();
        request.setTargetUserId(targetId);
        request.setSwipeType("PASS");

        when(swipeRepository.findBySwiperIdAndTargetId(swiperId, targetId)).thenReturn(Optional.empty());

        SwipeResponse response = swipeService.processSwipe(swiperId, request);

        assertThat(response.isMatch()).isFalse();
        assertThat(response.getMatchId()).isNull();
        verify(swipeRepository).save(any(Swipe.class));
        verify(matchRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should detect mutual match and notify target user when both like each other")
    void shouldDetectMutualMatch() {
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();

        SwipeRequest request = new SwipeRequest();
        request.setTargetUserId(userB);
        request.setSwipeType("LIKE");

        when(swipeRepository.findBySwiperIdAndTargetId(userA, userB)).thenReturn(Optional.empty());
        // Target user B already liked user A
        when(swipeRepository.existsBySwiperIdAndTargetIdAndSwipeType(userB, userA, "LIKE")).thenReturn(true);

        UUID matchId = UUID.randomUUID();
        Match createdMatch = Match.builder()
            .id(matchId)
            .user1Id(userA.compareTo(userB) < 0 ? userA : userB)
            .user2Id(userA.compareTo(userB) < 0 ? userB : userA)
            .isActive(true)
            .build();

        when(matchRepository.findActiveMatchBetweenUsers(any(), any())).thenReturn(Optional.empty());
        when(matchRepository.save(any(Match.class))).thenReturn(createdMatch);

        Profile profileB = Profile.builder()
            .userId(userB)
            .firstName("Sophia")
            .birthDate(LocalDate.of(1999, 1, 1))
            .gender("FEMALE")
            .photos(Collections.emptyList())
            .build();

        Profile profileA = Profile.builder()
            .userId(userA)
            .firstName("Alex")
            .birthDate(LocalDate.of(1998, 1, 1))
            .gender("MALE")
            .photos(Collections.emptyList())
            .build();

        when(profileRepository.findById(userB)).thenReturn(Optional.of(profileB));
        when(profileRepository.findById(userA)).thenReturn(Optional.of(profileA));

        SwipeResponse response = swipeService.processSwipe(userA, request);

        assertThat(response.isMatch()).isTrue();
        assertThat(response.getMatchId()).isEqualTo(matchId);
        assertThat(response.getMatchedProfile().getFirstName()).isEqualTo("Sophia");

        // Verify WebSocket notification sent to userB
        verify(messagingTemplate).convertAndSendToUser(
            eq(userB.toString()),
            eq("/queue/notifications"),
            any(Object.class)
        );
    }
}
