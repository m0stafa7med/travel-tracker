package com.traveltracker.controller;

import com.traveltracker.dto.PlaceDto;
import com.traveltracker.service.PlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
@Tag(name = "Places (Public)", description = "Public endpoints for places")
@CrossOrigin(origins = "*")
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    @Operation(summary = "Get all places")
    public ResponseEntity<List<PlaceDto>> getAllPlaces(
            @RequestParam(required = false) Long countryId) {
        if (countryId != null) {
            return ResponseEntity.ok(placeService.getPlacesByCountry(countryId));
        }
        return ResponseEntity.ok(placeService.getAllPlaces());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get place by ID")
    public ResponseEntity<PlaceDto> getPlaceById(@PathVariable Long id) {
        return ResponseEntity.ok(placeService.getPlaceById(id));
    }
}
