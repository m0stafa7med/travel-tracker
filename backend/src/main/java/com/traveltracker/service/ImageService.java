package com.traveltracker.service;

import com.traveltracker.dto.ImageDto;
import com.traveltracker.entity.Image;
import com.traveltracker.entity.Place;
import com.traveltracker.repository.ImageRepository;
import com.traveltracker.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final ImageRepository imageRepository;
    private final PlaceRepository placeRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public ImageDto uploadImage(Long placeId, MultipartFile file) throws IOException {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("Place not found with id: " + placeId));

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : "";
        String storedFileName = UUID.randomUUID() + extension;

        Path targetLocation = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Image image = Image.builder()
                .url("/uploads/" + storedFileName)
                .fileName(originalFilename)
                .place(place)
                .build();

        Image saved = imageRepository.save(image);

        return ImageDto.builder()
                .id(saved.getId())
                .url(saved.getUrl())
                .fileName(saved.getFileName())
                .build();
    }

    @Transactional
    public void deleteImage(Long id) throws IOException {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));

        String fileName = image.getUrl().replace("/uploads/", "");
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
        Files.deleteIfExists(filePath);

        imageRepository.delete(image);
    }
}
