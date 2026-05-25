package edu.cit.aytona.foodspotter.features.stalls.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StallDTO {
    private Long id;
    private String name;
    private String description;
    private String cuisine;
    private String imageUrl;
    private Long imageSizeBytes;
    private String address;
    private String menuJson;
    private Double latitude;
    private Double longitude;
    private String status;
    private String ownerEmail;
}
