package com.meaowmatch.repository;

import com.meaowmatch.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByMatchIdOrderBySentAtAsc(UUID matchId);

    List<Message> findByMatchIdOrderBySentAtDesc(UUID matchId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.match.id = :matchId AND m.sender.id != :userId AND m.isRead = false")
    int countUnreadMessages(@Param("matchId") UUID matchId, @Param("userId") UUID userId);

    @Query("SELECT m FROM Message m WHERE m.match.id = :matchId ORDER BY m.sentAt DESC LIMIT 1")
    Optional<Message> findLatestMessage(@Param("matchId") UUID matchId);
}
