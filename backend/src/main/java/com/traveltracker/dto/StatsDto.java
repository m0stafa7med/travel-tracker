package com.traveltracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsDto {
    private long totalCountries;
    private long visitedCountries;
    private long totalPlaces;
    private double visitedPercentage;
    private PlaceDto lastAddedPlace;
}
