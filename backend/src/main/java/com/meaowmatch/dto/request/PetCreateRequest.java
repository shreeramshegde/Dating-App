package com.meaowmatch.dto.request;

import com.meaowmatch.entity.Pet;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetCreateRequest {

    @NotBlank(message = "Pet name is required")
    private String name;

    @NotNull(message = "Species is required")
    private Pet.Species species; // DOG, CAT, BIRD, REPTILE, SMALL_ANIMAL, OTHER

    private String breed;

    private Integer ageMonths;

    private Pet.PetGender gender;

    private Pet.PetSize size;

    private String description;

    private Pet.ListingType listingType; // ADOPTION, FOSTER, RESCUE_ALERT

    private Pet.Urgency urgency; // NORMAL, HIGH, CRITICAL

    private String healthStatus;

    private Double latitude;

    private Double longitude;

    private String city;

    private List<String> photoUrls;
}
