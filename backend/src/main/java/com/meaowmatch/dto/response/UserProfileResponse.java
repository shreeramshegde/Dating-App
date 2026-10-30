package com.meaowmatch.dto.response;

import com.meaowmatch.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private UUID id;
    private String email;
    private User.UserRole role;
    private String fullName;
    private String phone;
    private String city;
    private Double latitude;
    private Double longitude;
}
