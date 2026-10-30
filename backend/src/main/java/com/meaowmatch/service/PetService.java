package com.meaowmatch.service;

import com.meaowmatch.dto.request.PetCreateRequest;
import com.meaowmatch.dto.request.PetUpdateRequest;
import com.meaowmatch.dto.response.PhotoDto;
import com.meaowmatch.dto.response.PresignedUploadResponse;
import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.PetPhoto;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.PetPhotoRepository;
import com.meaowmatch.repository.PetRepository;
import com.meaowmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final PetPhotoRepository petPhotoRepository;
    private final UserRepository userRepository;
    private final S3StorageService s3StorageService;

    @Transactional
    public PetResponse createPet(UUID ownerId, PetCreateRequest request) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Pet pet = Pet.builder()
            .owner(owner)
            .name(request.getName())
            .species(request.getSpecies())
            .breed(request.getBreed())
            .ageMonths(request.getAgeMonths())
            .gender(request.getGender() != null ? request.getGender() : Pet.PetGender.UNKNOWN)
            .size(request.getSize() != null ? request.getSize() : Pet.PetSize.MEDIUM)
            .description(request.getDescription())
            .listingType(request.getListingType() != null ? request.getListingType() : Pet.ListingType.ADOPTION)
            .urgency(request.getUrgency() != null ? request.getUrgency() : Pet.Urgency.NORMAL)
            .healthStatus(request.getHealthStatus())
            .status(Pet.PetStatus.AVAILABLE)
            .latitude(request.getLatitude() != null ? request.getLatitude() : owner.getLatitude())
            .longitude(request.getLongitude() != null ? request.getLongitude() : owner.getLongitude())
            .city(request.getCity() != null ? request.getCity() : owner.getCity())
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

        return mapToResponse(savedPet, null);
    }

    @Transactional(readOnly = true)
    public PetResponse getPetById(UUID petId) {
        Pet pet = petRepository.findById(petId)
            .orElseThrow(() -> new IllegalArgumentException("Pet not found with ID: " + petId));
        return mapToResponse(pet, null);
    }

    @Transactional(readOnly = true)
    public List<PetResponse> getMyPets(UUID ownerId) {
        return petRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
            .stream()
            .map(p -> mapToResponse(p, null))
            .toList();
    }

    @Transactional
    public PetResponse updatePet(UUID ownerId, UUID petId, PetUpdateRequest request) {
        Pet pet = petRepository.findById(petId)
            .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to modify this pet listing");
        }

        if (request.getName() != null) pet.setName(request.getName());
        if (request.getSpecies() != null) pet.setSpecies(request.getSpecies());
        if (request.getBreed() != null) pet.setBreed(request.getBreed());
        if (request.getAgeMonths() != null) pet.setAgeMonths(request.getAgeMonths());
        if (request.getGender() != null) pet.setGender(request.getGender());
        if (request.getSize() != null) pet.setSize(request.getSize());
        if (request.getDescription() != null) pet.setDescription(request.getDescription());
        if (request.getListingType() != null) pet.setListingType(request.getListingType());
        if (request.getUrgency() != null) pet.setUrgency(request.getUrgency());
        if (request.getHealthStatus() != null) pet.setHealthStatus(request.getHealthStatus());
        if (request.getStatus() != null) pet.setStatus(request.getStatus());
        if (request.getLatitude() != null) pet.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) pet.setLongitude(request.getLongitude());
        if (request.getCity() != null) pet.setCity(request.getCity());

        if (request.getPhotoUrls() != null) {
            petPhotoRepository.deleteByPetId(pet.getId());
            pet.getPhotos().clear();
            for (int i = 0; i < request.getPhotoUrls().size(); i++) {
                PetPhoto photo = PetPhoto.builder()
                    .pet(pet)
                    .photoUrl(request.getPhotoUrls().get(i))
                    .displayOrder(i)
                    .isPrimary(i == 0)
                    .build();
                pet.getPhotos().add(petPhotoRepository.save(photo));
            }
        }

        return mapToResponse(petRepository.save(pet), null);
    }

    @Transactional
    public void deletePet(UUID ownerId, UUID petId) {
        Pet pet = petRepository.findById(petId)
            .orElseThrow(() -> new IllegalArgumentException("Pet not found"));

        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to delete this pet listing");
        }

        // Delete associated S3 photos
        pet.getPhotos().forEach(p -> s3StorageService.deleteFile(p.getPhotoUrl()));
        petRepository.delete(pet);
    }

    public PresignedUploadResponse generatePresignedUploadUrl(UUID userId, String contentType) {
        return s3StorageService.generatePresignedUploadUrl(userId, contentType);
    }

    public PetResponse mapToResponse(Pet pet, Double distanceKm) {
        List<PhotoDto> photoDtos = pet.getPhotos() != null ? pet.getPhotos().stream()
            .map(p -> PhotoDto.builder()
                .id(p.getId())
                .photoUrl(p.getPhotoUrl())
                .displayOrder(p.getDisplayOrder())
                .isPrimary(p.getIsPrimary())
                .build())
            .toList() : List.of();

        return PetResponse.builder()
            .id(pet.getId())
            .ownerId(pet.getOwner().getId())
            .ownerName(pet.getOwner().getFullName())
            .ownerPhone(pet.getOwner().getPhone())
            .name(pet.getName())
            .species(pet.getSpecies())
            .breed(pet.getBreed())
            .ageMonths(pet.getAgeMonths())
            .gender(pet.getGender())
            .size(pet.getSize())
            .description(pet.getDescription())
            .listingType(pet.getListingType())
            .urgency(pet.getUrgency())
            .healthStatus(pet.getHealthStatus())
            .status(pet.getStatus())
            .latitude(pet.getLatitude())
            .longitude(pet.getLongitude())
            .city(pet.getCity())
            .distanceKm(distanceKm != null ? Math.round(distanceKm * 10.0) / 10.0 : null)
            .photos(photoDtos)
            .createdAt(pet.getCreatedAt())
            .build();
    }
}
