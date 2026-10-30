package com.meaowmatch.service;

import com.meaowmatch.dto.request.PetCreateRequest;
import com.meaowmatch.dto.response.PetResponse;
import com.meaowmatch.entity.Pet;
import com.meaowmatch.entity.User;
import com.meaowmatch.repository.PetPhotoRepository;
import com.meaowmatch.repository.PetRepository;
import com.meaowmatch.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private PetPhotoRepository petPhotoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private S3StorageService s3StorageService;

    @InjectMocks
    private PetService petService;

    private User owner;
    private Pet pet;

    @BeforeEach
    void setUp() {
        owner = User.builder()
            .id(UUID.randomUUID())
            .email("owner@meaowmatch.org")
            .role(User.UserRole.REHOMER)
            .fullName("Alice Shelter")
            .build();

        pet = Pet.builder()
            .id(UUID.randomUUID())
            .owner(owner)
            .name("Milo")
            .species(Pet.Species.CAT)
            .breed("Ginger Tabby")
            .ageMonths(12)
            .listingType(Pet.ListingType.ADOPTION)
            .status(Pet.PetStatus.AVAILABLE)
            .photos(new ArrayList<>())
            .build();
    }

    @Test
    void testCreatePetSuccess() {
        PetCreateRequest req = PetCreateRequest.builder()
            .name("Milo")
            .species(Pet.Species.CAT)
            .breed("Ginger Tabby")
            .ageMonths(12)
            .listingType(Pet.ListingType.ADOPTION)
            .photoUrls(List.of("https://storage.neon.tech/photos/milo.jpg"))
            .build();

        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(petRepository.save(any(Pet.class))).thenReturn(pet);
        when(petPhotoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PetResponse resp = petService.createPet(owner.getId(), req);
        assertNotNull(resp);
        assertEquals("Milo", resp.getName());
        assertEquals(Pet.Species.CAT, resp.getSpecies());
    }

    @Test
    void testGetPetById() {
        when(petRepository.findById(pet.getId())).thenReturn(Optional.of(pet));

        PetResponse resp = petService.getPetById(pet.getId());
        assertNotNull(resp);
        assertEquals(pet.getId(), resp.getId());
        assertEquals("Milo", resp.getName());
    }
}
