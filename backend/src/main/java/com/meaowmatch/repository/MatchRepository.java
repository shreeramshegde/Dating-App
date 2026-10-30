package com.meaowmatch.repository;

import com.meaowmatch.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {

    @Query("SELECT m FROM Match m WHERE (m.user1.id = :userId OR m.user2.id = :userId) AND m.isActive = true ORDER BY m.updatedAt DESC")
    List<Match> findActiveMatchesByUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT m FROM Match m
        WHERE ((m.user1.id = :u1 AND m.user2.id = :u2) OR (m.user1.id = :u2 AND m.user2.id = :u1))
          AND (:petId IS NULL OR m.pet.id = :petId)
          AND m.isActive = true
        """)
    Optional<Match> findActiveMatchBetween(
        @Param("u1") UUID u1,
        @Param("u2") UUID u2,
        @Param("petId") UUID petId
    );
}
