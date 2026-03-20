package com.traveltracker.service;

import com.traveltracker.dto.CountryDto;
import com.traveltracker.entity.Country;
import com.traveltracker.repository.CountryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CountryService {

    private final CountryRepository countryRepository;

    public List<CountryDto> getAllCountries() {
        return countryRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public CountryDto getCountryById(Long id) {
        return countryRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Country not found with id: " + id));
    }

    @Transactional
    public CountryDto toggleVisited(Long id) {
        Country country = countryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Country not found with id: " + id));

        country.setVisited(!country.isVisited());
        country.setColor(country.isVisited() ? "#22c55e" : "#9ca3af");
        return toDto(countryRepository.save(country));
    }

    private CountryDto toDto(Country country) {
        return CountryDto.builder()
                .id(country.getId())
                .name(country.getName())
                .code(country.getCode())
                .visited(country.isVisited())
                .color(country.getColor())
                .placesCount(country.getPlaces() != null ? country.getPlaces().size() : 0)
                .build();
    }
}
