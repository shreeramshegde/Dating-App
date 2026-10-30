package com.meaowmatch.service;

import com.meaowmatch.dto.request.RescueReportRequest;
import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.entity.Match;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.PetPhoto;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.MatchRepository;
import com.meaowmatch.repository.PetPhotoRepository;
import com.meaowmatch.repository.PetRepository;
import com.meaowmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RescueService {

    private final PetRepository petRepository;
    private final PetPhotoRepository petPhotoRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final PetService petService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public PetResponse createRescueAlert(UUID reporterId, RescueReportRequest request) {
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new IllegalArgumentException("Reporter user not found"));

        String petName = request.getTitleOrName() != null && !request.getTitleOrName().isBlank()
            ? request.getTitleOrName()
            : "Injured " + request.getSpecies() + " Alert";

        String description = request.getDescription();
        if (request.getAddressNote() != null && !request.getAddressNote().isBlank()) {
            description = (description != null ? description + "\n" : "") + "Location details: " + request.getAddressNote();
        }

        Pet pet = Pet.builder()
            .owner(reporter)
            .name(petName)
            .species(request.getSpecies())
            .gender(Pet.PetGender.UNKNOWN)
            .size(Pet.PetSize.MEDIUM)
            .description(description)
            .listingType(Pet.ListingType.RESCUE_ALERT)
            .urgency(request.getUrgency() != null ? request.getUrgency() : Pet.Urgency.CRITICAL)
            .healthStatus(request.getInjuryDetails())
            .status(Pet.PetStatus.AVAILABLE)
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .city(request.getCity() != null ? request.getCity() : reporter.getCity())
            .photos(new ArrayList<>())
            .build();

        Pet savedPet = petRepository.save(pet);

        if (request.getPhotoUrls() != null && !request.getPhotoUrls().isEmpty()) {
            for (int i = 0; i < request.getPhotoUrls().size(); i++) {
                PetPhoto photo = PetPhoto.builder()
                    .pet(savedPet)
                    .photoUrl(request.getPhotoUrls().get(i))
                    .displayOrder(i)
                    .isPrimary(i == 0)
                    .build();
                savedPet.getPhotos().add(petPhotoRepository.save(photo));
            }
        }

        log.info("Emergency rescue alert created: ID={}, Urgency={}, Species={}",
            savedPet.getId(), savedPet.getUrgency(), savedPet.getSpecies());

        return petService.mapToResponse(savedPet, 0.0);
    }

    @Transactional(readOnly = true)
    public List<PetResponse> getNearbyRescueAlerts(
        Pet.Species species,
        Double latitude,
        Double longitude,
        Integer maxDistanceKm,
        int limit
    ) {
        double userLat = latitude != null ? latitude : 0.0;
        double userLon = longitude != null ? longitude : 0.0;
        int distance = maxDistanceKm != null ? maxDistanceKm : 50;
        String speciesStr = species != null ? species.name() : null;

        List<Pet> alerts = petRepository.findNearbyRescueAlerts(
            speciesStr,
            userLat,
            userLon,
            distance,
            PageRequest.of(0, Math.min(limit, 50))
        );

        return alerts.stream()
            .map(alert -> {
                Double dist = calculateDistance(userLat, userLon, alert.getLatitude(), alert.getLongitude());
                return petService.mapToResponse(alert, dist);
            })
            .toList();
    }

    @Transactional
    public Match respondToRescueAlert(UUID volunteerId, UUID alertPetId) {
        User volunteer = userRepository.findById(volunteerId)
            .orElseThrow(() -> new IllegalArgumentException("Volunteer user not found"));

        Pet alertPet = petRepository.findById(alertPetId)
            .orElseThrow(() -> new IllegalArgumentException("Rescue alert not found with ID: " + alertPetId));

        if (alertPet.getOwner().getId().equals(volunteerId)) {
            throw new IllegalArgumentException("You cannot respond to your own rescue alert");
        }

        // Check if already matched
        return matchRepository.findActiveMatchBetween(volunteerId, alertPet.getOwner().getId(), alertPet.getId())
            .orElseGet(() -> {
                Match newMatch = Match.builder()
                    .user1(volunteer)
                    .user2(alertPet.getOwner())
                    .pet(alertPet)
                    .matchType("RESCUE")
                    .isActive(true)
                    .build();

                Match saved = matchRepository.save(newMatch);

                // Notify rescue reporter in real time
                messagingTemplate.convertAndSendToUser(
                    alertPet.getOwner().getId().toString(),
                    "/queue/notifications",
                    Map.of(
                        "type", "RESCUE_RESPONSE",
                        "matchId", saved.getId(),
                        "volunteerName", volunteer.getFullName() != null ? volunteer.getFullName() : "A volunteer",
                        "petName", alertPet.getName()
                    )
                );

                log.info("Rescue alert {} claimed by volunteer {}", alertPetId, volunteerId);
                return saved;
            });
    }

    private Double calculateDistance(double lat1, double lon1, Double lat2, Double lon2) {
        if (lat2 == null || lon2 == null) return null;
        double earthRadius = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}
