package edu.cit.aytona.foodspotter.dto;

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
    private Double latitude;
    private Double longitude;
    private String status;
}
