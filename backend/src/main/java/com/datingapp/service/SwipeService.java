package com.datingapp.service;

import com.datingapp.dto.request.SwipeRequest;
import com.datingapp.dto.response.DiscoveryCardDto;
import com.datingapp.dto.response.PhotoDto;
import com.datingapp.dto.response.SwipeResponse;
import com.datingapp.entity.Match;
import com.datingapp.entity.Profile;
import com.datingapp.entity.Swipe;
import com.datingapp.repository.MatchRepository;
import com.datingapp.repository.ProfileRepository;
import com.datingapp.repository.SwipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SwipeService {

    private final SwipeRepository swipeRepository;
    private final MatchRepository matchRepository;
    private final ProfileRepository profileRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public SwipeResponse processSwipe(UUID swiperId, SwipeRequest request) {
        UUID targetId = request.getTargetUserId();
        String swipeType = request.getSwipeType().toUpperCase();

        if (swiperId.equals(targetId)) {
            throw new IllegalArgumentException("Cannot swipe on yourself");
        }

        // 1. Record or update swipe
        Swipe swipe = swipeRepository.findBySwiperIdAndTargetId(swiperId, targetId)
            .orElseGet(() -> Swipe.builder()
                .swiperId(swiperId)
                .targetId(targetId)
                .build());

        swipe.setSwipeType(swipeType);
        swipeRepository.save(swipe);

        if (!"LIKE".equals(swipeType)) {
            return SwipeResponse.builder()
                .isMatch(false)
                .build();
        }

        // 2. Check if target user has liked current swiper
        boolean isMutual = swipeRepository.existsBySwiperIdAndTargetIdAndSwipeType(targetId, swiperId, "LIKE");

        if (isMutual) {
            // Guarantee deterministic user1 < user2 order for unique constraint
            UUID u1 = swiperId.compareTo(targetId) < 0 ? swiperId : targetId;
            UUID u2 = swiperId.compareTo(targetId) < 0 ? targetId : swiperId;

            Match match = matchRepository.findActiveMatchBetweenUsers(u1, u2)
                .orElseGet(() -> matchRepository.save(
                    Match.builder()
                        .user1Id(u1)
                        .user2Id(u2)
                        .isActive(true)
                        .build()
                ));

            // Load target profile
            Profile targetProfile = profileRepository.findById(targetId)
                .orElse(null);

            Profile swiperProfile = profileRepository.findById(swiperId)
                .orElse(null);

            // Notify target user via WebSocket queue
            if (targetProfile != null && swiperProfile != null) {
                messagingTemplate.convertAndSendToUser(
                    targetId.toString(),
                    "/queue/notifications",
                    Map.of(
                        "type", "MATCH",
                        "matchId", match.getId(),
                        "matchedWith", swiperProfile.getFirstName(),
                        "message", "You matched with " + swiperProfile.getFirstName() + "!"
                    )
                );
            }

            DiscoveryCardDto targetCard = targetProfile != null ? toCardDto(targetProfile) : null;

            return SwipeResponse.builder()
                .isMatch(true)
                .matchId(match.getId())
                .matchedProfile(targetCard)
                .build();
        }

        return SwipeResponse.builder()
            .isMatch(false)
            .build();
    }

    private DiscoveryCardDto toCardDto(Profile p) {
        return DiscoveryCardDto.builder()
            .userId(p.getUserId())
            .firstName(p.getFirstName())
            .age(ProfileService.calculateAge(p.getBirthDate()))
            .gender(p.getGender())
            .bio(p.getBio())
            .city(p.getCity())
            .photos(p.getPhotos().stream().map(photo -> PhotoDto.builder()
                .id(photo.getId())
                .photoUrl(photo.getPhotoUrl())
                .isPrimary(photo.getIsPrimary())
                .build()).collect(Collectors.toList()))
            .build();
    }
}
