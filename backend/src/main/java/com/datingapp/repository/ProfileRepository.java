package com.datingapp.repository;

import com.datingapp.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    @Query(value = """
        SELECT p.* FROM profiles p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id != :currentUserId
          AND u.status = 'ACTIVE'
          AND (
            :genderPref = 'EVERYONE' OR p.gender = :genderPref
          )
          AND (
            p.gender_preference = 'EVERYONE' OR p.gender_preference = :currentUserGender
          )
          AND EXTRACT(YEAR FROM age(CURRENT_DATE, p.birth_date)) BETWEEN :minAge AND :maxAge
          AND (
            :currentLat IS NULL OR :currentLon IS NULL OR p.latitude IS NULL OR p.longitude IS NULL OR
            (6371 * acos(
                least(1.0, greatest(-1.0,
                    cos(radians(:currentLat)) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(:currentLon)) +
                    sin(radians(:currentLat)) * sin(radians(p.latitude))
                ))
            )) <= :maxDistanceKm
          )
          AND p.user_id NOT IN (
              SELECT s.target_id FROM swipes s WHERE s.swiper_id = :currentUserId
          )
          AND p.user_id NOT IN (
              SELECT b.blocked_id FROM blocks b WHERE b.blocker_id = :currentUserId
              UNION
              SELECT b.blocker_id FROM blocks b WHERE b.blocked_id = :currentUserId
          )
        ORDER BY RANDOM()
        LIMIT :limit
        """, nativeQuery = true)
    List<Profile> findDiscoveryFeed(
        @Param("currentUserId") UUID currentUserId,
        @Param("genderPref") String genderPref,
        @Param("currentUserGender") String currentUserGender,
        @Param("minAge") int minAge,
        @Param("maxAge") int maxAge,
        @Param("currentLat") Double currentLat,
        @Param("currentLon") Double currentLon,
        @Param("maxDistanceKm") int maxDistanceKm,
        @Param("limit") int limit
    );
}
