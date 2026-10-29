package com.datingapp.service;

import com.datingapp.dto.response.DiscoveryCardDto;
import com.datingapp.dto.response.PhotoDto;
import com.datingapp.entity.Profile;
import com.datingapp.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<DiscoveryCardDto> getDiscoveryDeck(UUID currentUserId, int limit) {
        Profile currentUserProfile = profileRepository.findById(currentUserId)
            .orElseThrow(() -> new IllegalArgumentException("Complete your profile before discovering matches"));

        List<Profile> candidates = profileRepository.findDiscoveryFeed(
            currentUserId,
            currentUserProfile.getGenderPreference(),
            currentUserProfile.getGender(),
            currentUserProfile.getMinAgePref(),
            currentUserProfile.getMaxAgePref(),
            currentUserProfile.getLatitude(),
            currentUserProfile.getLongitude(),
            currentUserProfile.getMaxDistanceKm(),
            limit > 0 ? limit : 20
        );

        return candidates.stream().map(c -> {
            int age = ProfileService.calculateAge(c.getBirthDate());
            Double distance = null;
            if (currentUserProfile.getLatitude() != null && currentUserProfile.getLongitude() != null &&
                c.getLatitude() != null && c.getLongitude() != null) {
                distance = calculateHaversineKm(
                    currentUserProfile.getLatitude(), currentUserProfile.getLongitude(),
                    c.getLatitude(), c.getLongitude()
                );
            }

            List<PhotoDto> photos = c.getPhotos().stream()
                .map(p -> PhotoDto.builder()
                    .id(p.getId())
                    .photoUrl(p.getPhotoUrl())
                    .displayOrder(p.getDisplayOrder())
                    .isPrimary(p.getIsPrimary())
                    .build())
                .collect(Collectors.toList());

            return DiscoveryCardDto.builder()
                .userId(c.getUserId())
                .firstName(c.getFirstName())
                .age(age)
                .gender(c.getGender())
                .bio(c.getBio())
                .city(c.getCity())
                .distanceKm(distance != null ? Math.round(distance * 10.0) / 10.0 : null)
                .photos(photos)
                .build();
        }).collect(Collectors.toList());
    }

    private double calculateHaversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
