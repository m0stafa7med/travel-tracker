package com.traveltracker.controller;

import com.traveltracker.dto.ImageDto;
import com.traveltracker.dto.PlaceDto;
import com.traveltracker.dto.PlaceRequest;
import com.traveltracker.service.ImageService;
import com.traveltracker.service.PlaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
@Tag(name = "Places (Admin)", description = "Admin endpoints for managing places")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class AdminPlaceController {

    private final PlaceService placeService;
    private final ImageService imageService;

    @PostMapping
    @Operation(summary = "Create a new place")
    public ResponseEntity<PlaceDto> createPlace(@Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.ok(placeService.createPlace(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a place")
    public ResponseEntity<PlaceDto> updatePlace(@PathVariable Long id, @Valid @RequestBody PlaceRequest request) {
        return ResponseEntity.ok(placeService.updatePlace(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a place")
    public ResponseEntity<Void> deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{placeId}/images")
    @Operation(summary = "Upload image for a place")
    public ResponseEntity<ImageDto> uploadImage(
            @PathVariable Long placeId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(imageService.uploadImage(placeId, file));
    }

    @DeleteMapping("/images/{imageId}")
    @Operation(summary = "Delete an image")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) throws IOException {
        imageService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
