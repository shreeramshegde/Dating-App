package com.meaowmatch.dto.response;

import com.meaowmatch.entity.Pet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetResponse {
    private UUID id;
    private UUID ownerId;
    private String ownerName;
    private String ownerPhone;
    private String name;
    private Pet.Species species;
    private String breed;
    private Integer ageMonths;
    private Pet.PetGender gender;
    private Pet.PetSize size;
    private String description;
    private Pet.ListingType listingType;
    private Pet.Urgency urgency;
    private String healthStatus;
    private Pet.PetStatus status;
    private Double latitude;
    private Double longitude;
    private String city;
    private Double distanceKm;
    private List<PhotoDto> photos;
    private OffsetDateTime createdAt;
}
