package edu.cit.aytona.foodspotter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StallRequest {

    @NotBlank(message = "Stall name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Cuisine is required")
    private String cuisine;

    @NotBlank(message = "Latitude is required")
    private String latitude;

    @NotBlank(message = "Longitude is required")
    private String longitude;
}
