package com.meaowmatch.repository;

import com.meaowmatch.entity.Swipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SwipeRepository extends JpaRepository<Swipe, UUID> {
    Optional<Swipe> findByUserIdAndPetId(UUID userId, UUID petId);
    boolean existsByUserIdAndPetId(UUID userId, UUID petId);
}
