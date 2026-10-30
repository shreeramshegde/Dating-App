package com.meaowmatch.service;

import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.dto.response.SwipeResponse;
import com.meaowmatch.entity.Match;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.Swipe;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.MatchRepository;
import com.meaowmatch.repository.PetRepository;
import com.meaowmatch.repository.SwipeRepository;
import com.meaowmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SwipeService {

    private final SwipeRepository swipeRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final PetService petService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public SwipeResponse processSwipe(UUID swiperId, UUID petId, Swipe.SwipeType swipeType) {
        User swiper = userRepository.findById(swiperId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pet pet = petRepository.findById(petId)
            .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));

        if (pet.getOwner().getId().equals(swiperId)) {
            throw new IllegalArgumentException("You cannot swipe on your own pet listing");
        }

        // Check if already swiped
        Optional<Swipe> existingSwipe = swipeRepository.findByUserIdAndPetId(swiperId, petId);
        if (existingSwipe.isEmpty()) {
            Swipe swipe = Swipe.builder()
                .user(swiper)
                .pet(pet)
                .swipeType(swipeType)
                .build();
            swipeRepository.save(swipe);
        }

        if (swipeType == Swipe.SwipeType.PASS) {
            return SwipeResponse.builder()
                .match(false)
                .message("Pet passed")
                .build();
        }

        // Swiped LIKE -> Create an adoption inquiry match
        User owner = pet.getOwner();

        Optional<Match> existingMatch = matchRepository.findActiveMatchBetween(swiperId, owner.getId(), pet.getId());
        Match match = existingMatch.orElseGet(() -> {
            Match newMatch = Match.builder()
                .user1(swiper)
                .user2(owner)
                .pet(pet)
                .matchType(pet.getListingType().name())
                .isActive(true)
                .build();
            return matchRepository.save(newMatch);
        });

        PetResponse petResponse = petService.mapToResponse(pet, null);

        // Send real-time match notification to the pet owner/shelter
        messagingTemplate.convertAndSendToUser(
            owner.getId().toString(),
            "/queue/notifications",
            Map.of(
                "type", "ADOPTION_INQUIRY",
                "matchId", match.getId(),
                "adopterName", swiper.getFullName() != null ? swiper.getFullName() : swiper.getEmail(),
                "petName", pet.getName()
            )
        );

        log.info("Adoption match established between Adopter {} and Owner {} for Pet {}",
            swiperId, owner.getId(), petId);

        return SwipeResponse.builder()
            .match(true)
            .matchId(match.getId())
            .matchedPet(petResponse)
            .message("Congratulations! You matched with " + pet.getName() + "!")
            .build();
    }
}
