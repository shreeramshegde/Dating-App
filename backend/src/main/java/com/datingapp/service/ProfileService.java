package com.datingapp.service;

import com.datingapp.dto.request.ProfileUpdateRequest;
import com.datingapp.dto.response.PhotoDto;
import com.datingapp.dto.response.ProfileResponse;
import com.datingapp.entity.Profile;
import com.datingapp.entity.ProfilePhoto;
import com.datingapp.entity.User;
import com.datingapp.repository.ProfilePhotoRepository;
import com.datingapp.repository.ProfileRepository;
import com.datingapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfilePhotoRepository photoRepository;
    private final UserRepository userRepository;
    private final S3StorageService s3StorageService;

    @Transactional(readOnly = true)
    public ProfileResponse getProfileByUserId(UUID userId) {
        Profile profile = profileRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return mapToProfileResponse(profile, user.getEmail());
    }

    @Transactional
    public ProfileResponse upsertProfile(UUID userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Profile profile = profileRepository.findById(userId)
            .orElseGet(() -> Profile.builder()
                .userId(userId)
                .user(user)
                .build());

        profile.setFirstName(request.getFirstName());
        profile.setBirthDate(request.getBirthDate());
        profile.setGender(request.getGender().toUpperCase());
        profile.setGenderPreference(request.getGenderPreference() != null ? request.getGenderPreference().toUpperCase() : "EVERYONE");
        profile.setBio(request.getBio());
        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());
        profile.setCity(request.getCity());
        if (request.getMaxDistanceKm() != null) profile.setMaxDistanceKm(request.getMaxDistanceKm());
        if (request.getMinAgePref() != null) profile.setMinAgePref(request.getMinAgePref());
        if (request.getMaxAgePref() != null) profile.setMaxAgePref(request.getMaxAgePref());

        profile = profileRepository.save(profile);
        return mapToProfileResponse(profile, user.getEmail());
    }

    @Transactional
    public PhotoDto addPhoto(UUID userId, String photoUrl, Boolean isPrimary) {
        Profile profile = profileRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Profile must be created before uploading photos"));

        List<ProfilePhoto> currentPhotos = photoRepository.findByProfileUserIdOrderByDisplayOrderAsc(userId);

        boolean makePrimary = Boolean.TRUE.equals(isPrimary) || currentPhotos.isEmpty();

        if (makePrimary && !currentPhotos.isEmpty()) {
            for (ProfilePhoto p : currentPhotos) {
                p.setIsPrimary(false);
            }
            photoRepository.saveAll(currentPhotos);
        }

        ProfilePhoto photo = ProfilePhoto.builder()
            .profile(profile)
            .photoUrl(photoUrl)
            .displayOrder(currentPhotos.size())
            .isPrimary(makePrimary)
            .build();

        photo = photoRepository.save(photo);

        return PhotoDto.builder()
            .id(photo.getId())
            .photoUrl(photo.getPhotoUrl())
            .displayOrder(photo.getDisplayOrder())
            .isPrimary(photo.getIsPrimary())
            .build();
    }

    @Transactional
    public void deletePhoto(UUID userId, UUID photoId) {
        ProfilePhoto photo = photoRepository.findById(photoId)
            .orElseThrow(() -> new IllegalArgumentException("Photo not found"));

        if (!photo.getProfile().getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this photo");
        }

        photoRepository.delete(photo);
    }

    public ProfileResponse mapToProfileResponse(Profile profile, String email) {
        int age = calculateAge(profile.getBirthDate());
        List<PhotoDto> photoDtos = profile.getPhotos().stream()
            .map(p -> PhotoDto.builder()
                .id(p.getId())
                .photoUrl(p.getPhotoUrl())
                .displayOrder(p.getDisplayOrder())
                .isPrimary(p.getIsPrimary())
                .build())
            .collect(Collectors.toList());

        return ProfileResponse.builder()
            .userId(profile.getUserId())
            .email(email)
            .firstName(profile.getFirstName())
            .birthDate(profile.getBirthDate())
            .age(age)
            .gender(profile.getGender())
            .genderPreference(profile.getGenderPreference())
            .bio(profile.getBio())
            .latitude(profile.getLatitude())
            .longitude(profile.getLongitude())
            .city(profile.getCity())
            .maxDistanceKm(profile.getMaxDistanceKm())
            .minAgePref(profile.getMinAgePref())
            .maxAgePref(profile.getMaxAgePref())
            .photos(photoDtos)
            .build();
    }

    public static int calculateAge(LocalDate birthDate) {
        if (birthDate == null) return 18;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}
