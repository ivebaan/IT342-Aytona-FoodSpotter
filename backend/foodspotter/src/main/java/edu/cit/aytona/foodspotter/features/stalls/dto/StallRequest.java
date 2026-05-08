package edu.cit.aytona.foodspotter.features.stalls.dto;

import edu.cit.aytona.foodspotter.features.stalls.validation.AllowedCuisine;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StallRequest {

    @NotBlank(message = "Stall name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Cuisine is required")
    @AllowedCuisine
    private String cuisine;

    @NotBlank(message = "Latitude is required")
    private String latitude;

    @NotBlank(message = "Longitude is required")
    private String longitude;
}
