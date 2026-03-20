package com.traveltracker.repository;

import com.traveltracker.entity.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByCountryId(Long countryId);
    List<Place> findAllByOrderByVisitDateDesc();
}
