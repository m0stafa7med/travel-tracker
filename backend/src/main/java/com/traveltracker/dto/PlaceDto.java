package com.traveltracker.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceDto {
    private Long id;
    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private LocalDate visitDate;
    private Long countryId;
    private String countryName;
    private String category;
    private String categoryColor;
    private List<ImageDto> images;
}
