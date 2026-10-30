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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SwipeServiceTest {

    @Mock
    private SwipeRepository swipeRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private PetService petService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private SwipeService swipeService;

    private User adopter;
    private User owner;
    private Pet pet;

    @BeforeEach
    void setUp() {
        adopter = User.builder()
            .id(UUID.randomUUID())
            .email("adopter@meaowmatch.org")
            .fullName("Bob Adopter")
            .role(User.UserRole.ADOPTER)
            .build();

        owner = User.builder()
            .id(UUID.randomUUID())
            .email("owner@meaowmatch.org")
            .fullName("Sarah Shelter")
            .role(User.UserRole.REHOMER)
            .build();

        pet = Pet.builder()
            .id(UUID.randomUUID())
            .owner(owner)
            .name("Luna")
            .species(Pet.Species.CAT)
            .listingType(Pet.ListingType.ADOPTION)
            .status(Pet.PetStatus.AVAILABLE)
            .build();
    }

    @Test
    void testSwipePass() {
        when(userRepository.findById(adopter.getId())).thenReturn(Optional.of(adopter));
        when(petRepository.findById(pet.getId())).thenReturn(Optional.of(pet));
        when(swipeRepository.findByUserIdAndPetId(adopter.getId(), pet.getId())).thenReturn(Optional.empty());

        SwipeResponse resp = swipeService.processSwipe(adopter.getId(), pet.getId(), Swipe.SwipeType.PASS);
        assertNotNull(resp);
        assertFalse(resp.isMatch());
        assertEquals("Pet passed", resp.getMessage());
        verify(swipeRepository).save(any(Swipe.class));
    }

    @Test
    void testSwipeLikeCreatesMatch() {
        when(userRepository.findById(adopter.getId())).thenReturn(Optional.of(adopter));
        when(petRepository.findById(pet.getId())).thenReturn(Optional.of(pet));
        when(swipeRepository.findByUserIdAndPetId(adopter.getId(), pet.getId())).thenReturn(Optional.empty());
        when(matchRepository.findActiveMatchBetween(adopter.getId(), owner.getId(), pet.getId())).thenReturn(Optional.empty());

        Match match = Match.builder()
            .id(UUID.randomUUID())
            .user1(adopter)
            .user2(owner)
            .pet(pet)
            .matchType("ADOPTION")
            .build();
        when(matchRepository.save(any(Match.class))).thenReturn(match);
        when(petService.mapToResponse(any(), any())).thenReturn(
            PetResponse.builder().id(pet.getId()).name("Luna").build()
        );

        SwipeResponse resp = swipeService.processSwipe(adopter.getId(), pet.getId(), Swipe.SwipeType.LIKE);
        assertNotNull(resp);
        assertTrue(resp.isMatch());
        assertNotNull(resp.getMatchId());
        assertEquals("Luna", resp.getMatchedPet().getName());
        verify(messagingTemplate).convertAndSendToUser(eq(owner.getId().toString()), eq("/queue/notifications"), any(Object.class));
    }
}
