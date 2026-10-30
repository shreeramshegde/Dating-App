package com.meaowmatch.service;

import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.PetRepository;
import com.meaowmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final PetService petService;

    @Transactional(readOnly = true)
    public List<PetResponse> getDiscoveryFeed(
        UUID currentUserId,
        Pet.Species species,
        Pet.ListingType listingType,
        Double latitude,
        Double longitude,
        Integer maxDistanceKm,
        int limit
    ) {
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        double userLat = latitude != null ? latitude : (currentUser.getLatitude() != null ? currentUser.getLatitude() : 0.0);
        double userLon = longitude != null ? longitude : (currentUser.getLongitude() != null ? currentUser.getLongitude() : 0.0);
        int distance = maxDistanceKm != null ? maxDistanceKm : 50;

        String speciesStr = species != null ? species.name() : null;
        String listingTypeStr = listingType != null ? listingType.name() : null;

        List<Pet> nearbyPets = petRepository.findNearbyPets(
            currentUserId,
            speciesStr,
            listingTypeStr,
            userLat,
            userLon,
            distance,
            PageRequest.of(0, Math.min(limit, 50))
        );

        return nearbyPets.stream()
            .map(pet -> {
                Double dist = calculateDistance(userLat, userLon, pet.getLatitude(), pet.getLongitude());
                return petService.mapToResponse(pet, dist);
            })
            .toList();
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
