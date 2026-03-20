package com.traveltracker.repository;

import com.traveltracker.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByPlaceId(Long placeId);
}
