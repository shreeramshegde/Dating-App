package com.meaowmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoDto {
    private UUID id;
    private String photoUrl;
    private Integer displayOrder;
    private Boolean isPrimary;
}
