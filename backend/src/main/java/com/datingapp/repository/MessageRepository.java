package com.datingapp.repository;

import com.datingapp.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByMatchIdOrderBySentAtDesc(UUID matchId, Pageable pageable);
    Optional<Message> findFirstByMatchIdOrderBySentAtDesc(UUID matchId);
    long countByMatchIdAndSenderIdNotAndIsReadFalse(UUID matchId, UUID currentUserId);
}
