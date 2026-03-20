package com.traveltracker.controller;

import com.traveltracker.dto.CountryDto;
import com.traveltracker.service.CountryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/countries")
@RequiredArgsConstructor
@Tag(name = "Countries (Admin)", description = "Admin endpoints for managing countries")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class AdminCountryController {

    private final CountryService countryService;

    @PutMapping("/{id}/toggle-visit")
    @Operation(summary = "Toggle country visited status")
    public ResponseEntity<CountryDto> toggleVisited(@PathVariable Long id) {
        return ResponseEntity.ok(countryService.toggleVisited(id));
    }
}
