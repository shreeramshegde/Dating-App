package com.meaowmatch.dto.request;

import com.meaowmatch.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String city;
    private Double latitude;
    private Double longitude;
    private User.UserRole role;
}
