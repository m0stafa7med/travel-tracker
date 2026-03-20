package com.traveltracker.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CountryDto {
    private Long id;
    private String name;
    private String code;
    private boolean visited;
    private String color;
    private int placesCount;
}
