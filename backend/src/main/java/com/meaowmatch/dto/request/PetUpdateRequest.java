package com.meaowmatch.dto.request;

import com.meaowmatch.entity.Pet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetUpdateRequest {
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
    private Pet.PetStatus status; // AVAILABLE, PENDING, ADOPTED, RESCUED
    private Double latitude;
    private Double longitude;
    private String city;
    private List<String> photoUrls;
}
