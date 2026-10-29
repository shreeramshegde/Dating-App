package com.datingapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileUpdateRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotNull(message = "Birth date is required")
    private LocalDate birthDate;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String genderPreference = "EVERYONE";
    private String bio;
    private Double latitude;
    private Double longitude;
    private String city;
    private Integer maxDistanceKm = 50;
    private Integer minAgePref = 18;
    private Integer maxAgePref = 50;
}
