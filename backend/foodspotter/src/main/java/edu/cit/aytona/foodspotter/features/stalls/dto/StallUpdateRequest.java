package edu.cit.aytona.foodspotter.features.stalls.dto;

import lombok.Data;

@Data
public class StallUpdateRequest {
    private String name;
    private String description;
    private String cuisine;
    private String imageUrl;
    private String menuJson;
    private String latitude;
    private String longitude;
}