package com.datingapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscoveryCardDto {
    private UUID userId;
    private String firstName;
    private Integer age;
    private String gender;
    private String bio;
    private String city;
    private Double distanceKm;
    private List<PhotoDto> photos;
}
