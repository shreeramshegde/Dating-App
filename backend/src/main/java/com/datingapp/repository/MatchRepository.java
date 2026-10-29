package com.datingapp.repository;

import com.datingapp.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {

    @Query("SELECT m FROM Match m WHERE (m.user1Id = :userId OR m.user2Id = :userId) AND m.isActive = true ORDER BY m.updatedAt DESC")
    List<Match> findActiveMatchesForUser(@Param("userId") UUID userId);

    @Query("SELECT m FROM Match m WHERE ((m.user1Id = :u1 AND m.user2Id = :u2) OR (m.user1Id = :u2 AND m.user2Id = :u1)) AND m.isActive = true")
    Optional<Match> findActiveMatchBetweenUsers(@Param("u1") UUID u1, @Param("u2") UUID u2);
}
