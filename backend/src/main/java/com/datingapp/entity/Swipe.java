package com.datingapp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "swipes", uniqueConstraints = {
    @UniqueConstraint(name = "uq_swiper_target", columnNames = {"swiper_id", "target_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Swipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "swiper_id", nullable = false)
    private UUID swiperId;

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Column(name = "swipe_type", nullable = false, length = 10)
    private String swipeType; // LIKE or PASS

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
