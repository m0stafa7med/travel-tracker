package com.traveltracker.service;

import com.traveltracker.dto.PlaceDto;
import com.traveltracker.dto.StatsDto;
import com.traveltracker.repository.CountryRepository;
import com.traveltracker.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final CountryRepository countryRepository;
    private final PlaceRepository placeRepository;
    private final PlaceService placeService;

    public StatsDto getStats() {
        long totalCountries = countryRepository.count();
        long visitedCountries = countryRepository.countByVisitedTrue();
        long totalPlaces = placeRepository.count();
        double percentage = totalCountries > 0 ? (double) visitedCountries / totalCountries * 100 : 0;

        PlaceDto lastPlace = placeRepository.findAllByOrderByVisitDateDesc().stream()
                .findFirst()
                .map(placeService::toDto)
                .orElse(null);

        return StatsDto.builder()
                .totalCountries(totalCountries)
                .visitedCountries(visitedCountries)
                .totalPlaces(totalPlaces)
                .visitedPercentage(Math.round(percentage * 100.0) / 100.0)
                .lastAddedPlace(lastPlace)
                .build();
    }
}
