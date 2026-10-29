package com.datingapp.repository;

import com.datingapp.entity.Swipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SwipeRepository extends JpaRepository<Swipe, UUID> {
    boolean existsBySwiperIdAndTargetIdAndSwipeType(UUID swiperId, UUID targetId, String swipeType);
    Optional<Swipe> findBySwiperIdAndTargetId(UUID swiperId, UUID targetId);
}
