package com.datingapp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.domain.Persistable;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile implements Persistable<UUID> {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false, length = 20)
    private String gender;

    @Column(name = "gender_preference", nullable = false, length = 20)
    @Builder.Default
    private String genderPreference = "EVERYONE";

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Double latitude;
    private Double longitude;

    @Column(length = 100)
    private String city;

    @Column(name = "max_distance_km", nullable = false)
    @Builder.Default
    private Integer maxDistanceKm = 50;

    @Column(name = "min_age_pref", nullable = false)
    @Builder.Default
    private Integer minAgePref = 18;

    @Column(name = "max_age_pref", nullable = false)
    @Builder.Default
    private Integer maxAgePref = 50;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ProfilePhoto> photos = new ArrayList<>();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public UUID getId() {
        return userId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PrePersist
    void markNotNew() {
        this.isNew = false;
    }
}
