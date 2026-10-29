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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private ProfilePhotoRepository photoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private S3StorageService s3StorageService;

    @InjectMocks
    private ProfileService profileService;

    @Test
    @DisplayName("Should correctly calculate age based on birth date")
    void shouldCalculateAgeCorrectly() {
        LocalDate birthDate = LocalDate.now().minusYears(25);
        int age = ProfileService.calculateAge(birthDate);
        assertThat(age).isEqualTo(25);
    }

    @Test
    @DisplayName("Should create or update user profile")
    void shouldUpsertProfile() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("alex@example.com").build();

        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setFirstName("Alex");
        request.setBirthDate(LocalDate.of(1998, 5, 14));
        request.setGender("MALE");
        request.setGenderPreference("FEMALE");
        request.setBio("Hello world");
        request.setCity("San Francisco");

        Profile profile = Profile.builder()
            .userId(userId)
            .user(user)
            .photos(new ArrayList<>())
            .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(profileRepository.findById(userId)).thenReturn(Optional.of(profile));
        when(profileRepository.save(any(Profile.class))).thenAnswer(i -> i.getArgument(0));

        ProfileResponse response = profileService.upsertProfile(userId, request);

        assertThat(response.getFirstName()).isEqualTo("Alex");
        assertThat(response.getGender()).isEqualTo("MALE");
        assertThat(response.getCity()).isEqualTo("San Francisco");
        assertThat(response.getEmail()).isEqualTo("alex@example.com");
    }

    @Test
    @DisplayName("Should set first uploaded photo as primary automatically")
    void shouldSetFirstPhotoAsPrimary() {
        UUID userId = UUID.randomUUID();
        Profile profile = Profile.builder().userId(userId).build();

        when(profileRepository.findById(userId)).thenReturn(Optional.of(profile));
        when(photoRepository.findByProfileUserIdOrderByDisplayOrderAsc(userId)).thenReturn(new ArrayList<>());
        when(photoRepository.save(any(ProfilePhoto.class))).thenAnswer(i -> {
            ProfilePhoto p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        PhotoDto photoDto = profileService.addPhoto(userId, "https://storage.neon.tech/photo1.jpg", false);

        assertThat(photoDto.getIsPrimary()).isTrue();
        assertThat(photoDto.getPhotoUrl()).isEqualTo("https://storage.neon.tech/photo1.jpg");
    }

    @Test
    @DisplayName("Should prevent deleting other users' photos")
    void shouldPreventUnauthorizedPhotoDeletion() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID photoId = UUID.randomUUID();

        Profile ownerProfile = Profile.builder().userId(ownerId).build();
        ProfilePhoto photo = ProfilePhoto.builder().id(photoId).profile(ownerProfile).build();

        when(photoRepository.findById(photoId)).thenReturn(Optional.of(photo));

        assertThatThrownBy(() -> profileService.deletePhoto(otherUserId, photoId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Unauthorized to delete this photo");

        verify(photoRepository, never()).delete(any());
    }
}
