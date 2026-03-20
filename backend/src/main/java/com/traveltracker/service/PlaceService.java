package com.traveltracker.service;

import com.traveltracker.dto.ImageDto;
import com.traveltracker.dto.PlaceDto;
import com.traveltracker.dto.PlaceRequest;
import com.traveltracker.entity.Country;
import com.traveltracker.entity.Place;
import com.traveltracker.repository.CountryRepository;
import com.traveltracker.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final CountryRepository countryRepository;

    public List<PlaceDto> getAllPlaces() {
        return placeRepository.findAllByOrderByVisitDateDesc().stream()
                .map(this::toDto)
                .toList();
    }

    public List<PlaceDto> getPlacesByCountry(Long countryId) {
        return placeRepository.findByCountryId(countryId).stream()
                .map(this::toDto)
                .toList();
    }

    public PlaceDto getPlaceById(Long id) {
        return placeRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Place not found with id: " + id));
    }

    @Transactional
    public PlaceDto createPlace(PlaceRequest request) {
        Country country = countryRepository.findById(request.getCountryId())
                .orElseThrow(() -> new RuntimeException("Country not found with id: " + request.getCountryId()));

        Place place = Place.builder()
                .name(request.getName())
                .description(request.getDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .visitDate(request.getVisitDate())
                .country(country)
                .category(request.getCategory())
                .categoryColor(request.getCategoryColor())
                .build();

        return toDto(placeRepository.save(place));
    }

    @Transactional
    public PlaceDto updatePlace(Long id, PlaceRequest request) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found with id: " + id));

        Country country = countryRepository.findById(request.getCountryId())
                .orElseThrow(() -> new RuntimeException("Country not found with id: " + request.getCountryId()));

        place.setName(request.getName());
        place.setDescription(request.getDescription());
        place.setLatitude(request.getLatitude());
        place.setLongitude(request.getLongitude());
        place.setVisitDate(request.getVisitDate());
        place.setCountry(country);
        place.setCategory(request.getCategory());
        place.setCategoryColor(request.getCategoryColor());

        return toDto(placeRepository.save(place));
    }

    @Transactional
    public void deletePlace(Long id) {
        if (!placeRepository.existsById(id)) {
            throw new RuntimeException("Place not found with id: " + id);
        }
        placeRepository.deleteById(id);
    }

    public PlaceDto toDto(Place place) {
        List<ImageDto> images = place.getImages() != null
                ? place.getImages().stream()
                    .map(img -> ImageDto.builder()
                            .id(img.getId())
                            .url(img.getUrl())
                            .fileName(img.getFileName())
                            .build())
                    .toList()
                : List.of();

        return PlaceDto.builder()
                .id(place.getId())
                .name(place.getName())
                .description(place.getDescription())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .visitDate(place.getVisitDate())
                .countryId(place.getCountry().getId())
                .countryName(place.getCountry().getName())
                .category(place.getCategory())
                .categoryColor(place.getCategoryColor())
                .images(images)
                .build();
    }
}
