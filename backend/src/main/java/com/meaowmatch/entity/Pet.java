package com.meaowmatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Species species;

    @Column
    private String breed;

    @Column(name = "age_months")
    private Integer ageMonths;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PetGender gender = PetGender.UNKNOWN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PetSize size = PetSize.MEDIUM;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_type", nullable = false)
    @Builder.Default
    private ListingType listingType = ListingType.ADOPTION;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Urgency urgency = Urgency.NORMAL;

    @Column(name = "health_status", columnDefinition = "TEXT")
    private String healthStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PetStatus status = PetStatus.AVAILABLE;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column
    private String city;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<PetPhoto> photos = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public enum Species {
        DOG,
        CAT,
        BIRD,
        REPTILE,
        SMALL_ANIMAL, // Rabbits, hamsters, guinea pigs
        OTHER
    }

    public enum ListingType {
        ADOPTION,      // Looking for forever home
        FOSTER,        // Temporary foster care needed
        RESCUE_ALERT   // Injured or stray animal in urgent need of rescue
    }

    public enum Urgency {
        NORMAL,
        HIGH,
        CRITICAL       // Emergency medical rescue needed immediately
    }

    public enum PetStatus {
        AVAILABLE,
        PENDING,
        ADOPTED,
        RESCUED
    }

    public enum PetGender {
        MALE,
        FEMALE,
        UNKNOWN
    }

    public enum PetSize {
        SMALL,
        MEDIUM,
        LARGE
    }
}
