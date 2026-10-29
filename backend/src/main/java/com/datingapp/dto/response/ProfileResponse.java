package com.datingapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private UUID userId;
    private String email;
    private String firstName;
    private LocalDate birthDate;
    private Integer age;
    private String gender;
    private String genderPreference;
    private String bio;
    private Double latitude;
    private Double longitude;
    private String city;
    private Integer maxDistanceKm;
    private Integer minAgePref;
    private Integer maxAgePref;
    private List<PhotoDto> photos;
}
