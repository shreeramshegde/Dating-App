package com.meaowmatch.dto.request;

import com.meaowmatch.entity.Pet;
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
public class RescueReportRequest {

    private String titleOrName; // e.g. "Injured kitten found near central park"

    @NotNull(message = "Species is required")
    private Pet.Species species; // DOG, CAT, BIRD, REPTILE, SMALL_ANIMAL, OTHER

    private String description;

    private String injuryDetails; // e.g. "Bleeding left leg, unable to walk"

    @Builder.Default
    private Pet.Urgency urgency = Pet.Urgency.CRITICAL; // NORMAL, HIGH, CRITICAL

    @NotNull(message = "Latitude is required for rescue response")
    private Double latitude;

    @NotNull(message = "Longitude is required for rescue response")
    private Double longitude;

    private String city;

    private String addressNote; // e.g. "Behind the bakery on 5th street"

    private List<String> photoUrls;
}
