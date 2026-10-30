package com.meaowmatch.repository;

import com.meaowmatch.entity.Pet;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PetRepository extends JpaRepository<Pet, UUID> {

    List<Pet> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    List<Pet> findByListingTypeAndStatusOrderByCreatedAtDesc(Pet.ListingType listingType, Pet.PetStatus status);

    /**
     * Discovery query for adopters:
     * Returns available pets not swiped on by current user, optionally filtered by species and listing type,
     * within max distance (km) using the Haversine spherical distance calculation.
     */
    @Query(value = """
        SELECT p.*,
               (6371 * acos(
                   LEAST(1.0, GREATEST(-1.0,
                       cos(radians(:userLat)) * cos(radians(p.latitude)) *
                       cos(radians(p.longitude) - radians(:userLon)) +
                       sin(radians(:userLat)) * sin(radians(p.latitude))
                   ))
               )) AS distance_km
        FROM pets p
        WHERE p.status = 'AVAILABLE'
          AND (:currentUserId IS NULL OR p.owner_id != :currentUserId)
          AND (:currentUserId IS NULL OR p.id NOT IN (
              SELECT s.pet_id FROM pet_swipes s WHERE s.user_id = :currentUserId
          ))
          AND (:species IS NULL OR p.species = :species)
          AND (:listingType IS NULL OR p.listing_type = :listingType)
          AND (
              p.latitude IS NULL OR p.longitude IS NULL OR
              (6371 * acos(
                  LEAST(1.0, GREATEST(-1.0,
                      cos(radians(:userLat)) * cos(radians(p.latitude)) *
                      cos(radians(p.longitude) - radians(:userLon)) +
                      sin(radians(:userLat)) * sin(radians(p.latitude))
                  ))
              )) <= :maxDistanceKm
          )
        ORDER BY distance_km ASC NULLS LAST, p.created_at DESC
        """, nativeQuery = true)
    List<Pet> findNearbyPets(
        @Param("currentUserId") UUID currentUserId,
        @Param("species") String species,
        @Param("listingType") String listingType,
        @Param("userLat") double userLat,
        @Param("userLon") double userLon,
        @Param("maxDistanceKm") int maxDistanceKm,
        Pageable pageable
    );

    /**
     * Emergency Rescue Alerts Discovery Query:
     * Returns all open RESCUE_ALERT listings within max distance (km),
     * prioritized by urgency (CRITICAL first, then HIGH, then NORMAL) and proximity.
     */
    @Query(value = """
        SELECT p.*,
               (6371 * acos(
                   LEAST(1.0, GREATEST(-1.0,
                       cos(radians(:userLat)) * cos(radians(p.latitude)) *
                       cos(radians(p.longitude) - radians(:userLon)) +
                       sin(radians(:userLat)) * sin(radians(p.latitude))
                   ))
               )) AS distance_km
        FROM pets p
        WHERE p.listing_type = 'RESCUE_ALERT'
          AND p.status = 'AVAILABLE'
          AND (:species IS NULL OR p.species = :species)
          AND (
              p.latitude IS NULL OR p.longitude IS NULL OR
              (6371 * acos(
                  LEAST(1.0, GREATEST(-1.0,
                      cos(radians(:userLat)) * cos(radians(p.latitude)) *
                      cos(radians(p.longitude) - radians(:userLon)) +
                      sin(radians(:userLat)) * sin(radians(p.latitude))
                  ))
              )) <= :maxDistanceKm
          )
        ORDER BY
            CASE p.urgency
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                ELSE 3
            END ASC,
            distance_km ASC NULLS LAST,
            p.created_at DESC
        """, nativeQuery = true)
    List<Pet> findNearbyRescueAlerts(
        @Param("species") String species,
        @Param("userLat") double userLat,
        @Param("userLon") double userLon,
        @Param("maxDistanceKm") int maxDistanceKm,
        Pageable pageable
    );
}
