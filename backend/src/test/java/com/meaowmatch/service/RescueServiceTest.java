package com.meaowmatch.service;

import com.meaowmatch.dto.request.RescueReportRequest;
import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.entity.Match;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.MatchRepository;
import com.meaowmatch.repository.PetPhotoRepository;
import com.meaowmatch.repository.PetRepository;
import com.meaowmatch.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RescueServiceTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private PetPhotoRepository petPhotoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private PetService petService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private RescueService rescueService;

    private User rescuer;
    private User volunteer;
    private Pet rescuePet;

    @BeforeEach
    void setUp() {
        rescuer = User.builder()
            .id(UUID.randomUUID())
            .email("rescuer@meaowmatch.org")
            .role(User.UserRole.RESCUER)
            .fullName("Sam Rescuer")
            .build();

        volunteer = User.builder()
            .id(UUID.randomUUID())
            .email("volunteer@meaowmatch.org")
            .role(User.UserRole.ADOPTER)
            .fullName("Vicky Volunteer")
            .build();

        rescuePet = Pet.builder()
            .id(UUID.randomUUID())
            .owner(rescuer)
            .name("Injured Pigeon")
            .species(Pet.Species.BIRD)
            .listingType(Pet.ListingType.RESCUE_ALERT)
            .urgency(Pet.Urgency.CRITICAL)
            .healthStatus("Injured wing, unable to fly")
            .status(Pet.PetStatus.AVAILABLE)
            .latitude(12.9716)
            .longitude(77.5946)
            .photos(new ArrayList<>())
            .build();
    }

    @Test
    void testCreateRescueAlert() {
        RescueReportRequest req = RescueReportRequest.builder()
            .titleOrName("Injured Pigeon")
            .species(Pet.Species.BIRD)
            .injuryDetails("Injured wing, unable to fly")
            .urgency(Pet.Urgency.CRITICAL)
            .latitude(12.9716)
            .longitude(77.5946)
            .build();

        when(userRepository.findById(rescuer.getId())).thenReturn(Optional.of(rescuer));
        when(petRepository.save(any(Pet.class))).thenReturn(rescuePet);
        when(petService.mapToResponse(any(), any())).thenReturn(
            PetResponse.builder()
                .id(rescuePet.getId())
                .name("Injured Pigeon")
                .species(Pet.Species.BIRD)
                .listingType(Pet.ListingType.RESCUE_ALERT)
                .urgency(Pet.Urgency.CRITICAL)
                .build()
        );

        PetResponse resp = rescueService.createRescueAlert(rescuer.getId(), req);
        assertNotNull(resp);
        assertEquals(Pet.Urgency.CRITICAL, resp.getUrgency());
        assertEquals(Pet.Species.BIRD, resp.getSpecies());
    }

    @Test
    void testRespondToRescueAlertCreatesMatch() {
        when(userRepository.findById(volunteer.getId())).thenReturn(Optional.of(volunteer));
        when(petRepository.findById(rescuePet.getId())).thenReturn(Optional.of(rescuePet));
        when(matchRepository.findActiveMatchBetween(volunteer.getId(), rescuer.getId(), rescuePet.getId()))
            .thenReturn(Optional.empty());

        Match match = Match.builder()
            .id(UUID.randomUUID())
            .user1(volunteer)
            .user2(rescuer)
            .pet(rescuePet)
            .matchType("RESCUE")
            .build();

        when(matchRepository.save(any(Match.class))).thenReturn(match);

        Match result = rescueService.respondToRescueAlert(volunteer.getId(), rescuePet.getId());
        assertNotNull(result);
        assertEquals("RESCUE", result.getMatchType());
        verify(messagingTemplate).convertAndSendToUser(eq(rescuer.getId().toString()), eq("/queue/notifications"), any(Object.class));
    }
}
