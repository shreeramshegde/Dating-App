package com.meaowmatch.config;

import com.meaowmatch.entity.*;
import com.meaowmatch.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final PetPhotoRepository petPhotoRepository;
    private final MatchRepository matchRepository;
    private final MessageRepository messageRepository;
    private final SwipeRepository swipeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Automatically clean up legacy dating tables if they still exist in PostgreSQL
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS profiles, profile_photos, swipes CASCADE;");
            log.info("[DatabaseSeeder] Verified cleanup of legacy dating tables.");
        } catch (Exception e) {
            log.debug("[DatabaseSeeder] Table cleanup check: {}", e.getMessage());
        }

        // 2. Check if database already has pet listings
        if (petRepository.count() > 0) {
            log.info("[DatabaseSeeder] Database already populated with {} pets. Skipping seed.", petRepository.count());
            return;
        }

        log.info("[DatabaseSeeder] Database is empty. Seeding verified shelters, multi-species pets, and rescue alerts...");

        String encodedPassword = passwordEncoder.encode("Password123!");

        // 3. Seed Organizations & Rescuers
        User shelterHaven = userRepository.findByEmail("austin-haven@meaowmatch.org").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("austin-haven@meaowmatch.org")
                        .passwordHash(encodedPassword)
                        .role(User.UserRole.REHOMER)
                        .fullName("Austin Animal Haven")
                        .phone("+1-512-555-0101")
                        .city("Austin, TX")
                        .latitude(30.2672)
                        .longitude(-97.7431)
                        .status("ACTIVE")
                        .build())
        );

        User shelterHillCountry = userRepository.findByEmail("hill-country@meaowmatch.org").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("hill-country@meaowmatch.org")
                        .passwordHash(encodedPassword)
                        .role(User.UserRole.REHOMER)
                        .fullName("Hill Country Rescue")
                        .phone("+1-512-555-0102")
                        .city("Austin, TX")
                        .latitude(30.2849)
                        .longitude(-97.7341)
                        .status("ACTIVE")
                        .build())
        );

        User fosterNetwork = userRepository.findByEmail("foster-network@meaowmatch.org").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("foster-network@meaowmatch.org")
                        .passwordHash(encodedPassword)
                        .role(User.UserRole.REHOMER)
                        .fullName("Central Texas Foster Network")
                        .phone("+1-512-555-0103")
                        .city("Round Rock, TX")
                        .latitude(30.5083)
                        .longitude(-97.6789)
                        .status("ACTIVE")
                        .build())
        );

        User rabbitSanctuary = userRepository.findByEmail("rabbit-sanctuary@meaowmatch.org").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("rabbit-sanctuary@meaowmatch.org")
                        .passwordHash(encodedPassword)
                        .role(User.UserRole.REHOMER)
                        .fullName("Austin Rabbit Sanctuary")
                        .phone("+1-512-555-0104")
                        .city("Austin, TX")
                        .latitude(30.2500)
                        .longitude(-97.7500)
                        .status("ACTIVE")
                        .build())
        );

        User avianSanctuary = userRepository.findByEmail("avian-sanctuary@meaowmatch.org").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("avian-sanctuary@meaowmatch.org")
                        .passwordHash(encodedPassword)
                        .role(User.UserRole.REHOMER)
                        .fullName("Lone Star Avian Sanctuary")
                        .phone("+1-512-555-0105")
                        .city("Austin, TX")
                        .latitude(30.3000)
                        .longitude(-97.7200)
                        .status("ACTIVE")
                        .build())
        );

        User herpSociety = userRepository.findByEmail("herp-society@meaowmatch.org").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("herp-society@meaowmatch.org")
                        .passwordHash(encodedPassword)
                        .role(User.UserRole.REHOMER)
                        .fullName("Austin Herpetological Society")
                        .phone("+1-512-555-0106")
                        .city("Cedar Park, TX")
                        .latitude(30.5050)
                        .longitude(-97.8200)
                        .status("ACTIVE")
                        .build())
        );

        User spotter = userRepository.findByEmail("spotter-austin@meaowmatch.org").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("spotter-austin@meaowmatch.org")
                        .passwordHash(encodedPassword)
                        .role(User.UserRole.RESCUER)
                        .fullName("Citizen Emergency Spotter")
                        .phone("+1-512-555-0107")
                        .city("Austin, TX")
                        .latitude(30.2504)
                        .longitude(-97.7495)
                        .status("ACTIVE")
                        .build())
        );

        // 4. Seed Adoptable Pets with S3 Photos stored in DB
        Pet luna = seedPetWithPhotos(
                shelterHaven,
                "Luna",
                Pet.Species.CAT,
                "Domestic Short Hair",
                14,
                Pet.PetGender.FEMALE,
                Pet.PetSize.SMALL,
                "Playful, vocal, and deeply affectionate cat. Loves gentle forehead rubs and chirps at birds by the window. Fully vaccinated & litter trained.",
                Pet.ListingType.ADOPTION,
                Pet.Urgency.NORMAL,
                "Spayed, Microchipped, FeLV/FIV Negative",
                "Austin, TX",
                30.2672,
                -97.7431,
                List.of(
                        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80"
                )
        );

        Pet barnaby = seedPetWithPhotos(
                shelterHillCountry,
                "Barnaby",
                Pet.Species.DOG,
                "Australian Shepherd Mix",
                24,
                Pet.PetGender.MALE,
                Pet.PetSize.MEDIUM,
                "High energy, exceptionally smart, and eager to please. Looking for an active household with a yard or someone who loves hiking trails.",
                Pet.ListingType.ADOPTION,
                Pet.Urgency.NORMAL,
                "Neutered, Core Vaccinations up to date, Heartworm negative",
                "Austin, TX",
                30.2849,
                -97.7341,
                List.of(
                        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
                        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                fosterNetwork,
                "Milo",
                Pet.Species.DOG,
                "Golden Retriever Mix",
                8,
                Pet.PetGender.MALE,
                Pet.PetSize.LARGE,
                "Gentle giant in training! Friendly with other dogs, kids, and strangers. Working on basic leash manners.",
                Pet.ListingType.FOSTER,
                Pet.Urgency.HIGH,
                "Puppy vaccines completed, Dewormed",
                "Round Rock, TX",
                30.5083,
                -97.6789,
                List.of(
                        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                rabbitSanctuary,
                "Thumper & Clover",
                Pet.Species.SMALL_ANIMAL,
                "Holland Lop Bunnies",
                18,
                Pet.PetGender.UNKNOWN,
                Pet.PetSize.SMALL,
                "Bonded pair of gentle bunnies. Must be adopted together! They enjoy indoor free-roaming and fresh organic cilantro.",
                Pet.ListingType.ADOPTION,
                Pet.Urgency.NORMAL,
                "Neutered & Spayed pair",
                "Austin, TX",
                30.2500,
                -97.7500,
                List.of(
                        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                avianSanctuary,
                "Kiwi & Sunny",
                Pet.Species.BIRD,
                "Peach-faced Lovebirds",
                20,
                Pet.PetGender.UNKNOWN,
                Pet.PetSize.SMALL,
                "Sweet, inquisitive lovebird pair. They sing soft melodic whistles in the morning and love crunching on millet sprays and apple slices.",
                Pet.ListingType.ADOPTION,
                Pet.Urgency.NORMAL,
                "Avian vet check completed, Beak & Feather healthy",
                "Austin, TX",
                30.3000,
                -97.7200,
                List.of(
                        "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                herpSociety,
                "Ziggy",
                Pet.Species.REPTILE,
                "Central Bearded Dragon",
                36,
                Pet.PetGender.MALE,
                Pet.PetSize.MEDIUM,
                "Very docile, loves basking under warm UV lamps and sitting on shoulders while you read. Enjoys collard greens and dubia roaches.",
                Pet.ListingType.ADOPTION,
                Pet.Urgency.NORMAL,
                "Healthy calcium levels, sheds smoothly",
                "Cedar Park, TX",
                30.5050,
                -97.8200,
                List.of(
                        "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                shelterHaven,
                "Oliver",
                Pet.Species.CAT,
                "Maine Coon Mix",
                30,
                Pet.PetGender.MALE,
                Pet.PetSize.MEDIUM,
                "Fluffy, polydactyl sweetheart with a deep purr. Gets along well with calm dogs and enjoys sleeping at the foot of the bed.",
                Pet.ListingType.ADOPTION,
                Pet.Urgency.NORMAL,
                "Neutered, Microchipped, Vaccinations current",
                "Austin, TX",
                30.2700,
                -97.7400,
                List.of(
                        "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                fosterNetwork,
                "Bella",
                Pet.Species.DOG,
                "Corgi Mix",
                15,
                Pet.PetGender.FEMALE,
                Pet.PetSize.SMALL,
                "Spirited, smiling, and compact companion. Loves fetch, squeaky balls, and learning new agility tricks. Great with children.",
                Pet.ListingType.ADOPTION,
                Pet.Urgency.NORMAL,
                "Spayed, Vaccinated, Monthly flea/tick preventive",
                "Austin, TX",
                30.2900,
                -97.7500,
                List.of(
                        "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=800&q=80"
                )
        );

        // 5. Seed Emergency Animal Distress Alerts
        seedPetWithPhotos(
                spotter,
                "Injured Calico Stray",
                Pet.Species.CAT,
                "Domestic Calico",
                12,
                Pet.PetGender.FEMALE,
                Pet.PetSize.SMALL,
                "Limping on front right paw near South Congress food trailers. Appears frightened but approachable. Needs immediate transport to Austin Animal Clinic.",
                Pet.ListingType.RESCUE_ALERT,
                Pet.Urgency.CRITICAL,
                "Front paw injury, dehydration suspected",
                "Austin, TX",
                30.2504,
                -97.7495,
                List.of(
                        "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                spotter,
                "Abandoned Senior Terrier",
                Pet.Species.DOG,
                "Terrier Mix",
                84,
                Pet.PetGender.MALE,
                Pet.PetSize.SMALL,
                "Found wandering near Walnut Creek Park trailhead without collar or microchip. Very calm and docile. Needs temporary foster or shelter intake.",
                Pet.ListingType.RESCUE_ALERT,
                Pet.Urgency.HIGH,
                "Mild cataract, no visible open wounds",
                "Austin, TX",
                30.4011,
                -97.6974,
                List.of(
                        "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                spotter,
                "Disoriented Urban Songbird",
                Pet.Species.BIRD,
                "Native Songbird",
                6,
                Pet.PetGender.UNKNOWN,
                Pet.PetSize.SMALL,
                "Window strike collision near 6th and Congress office plaza. Breathing rapidly, kept safe in a ventilated cardboard box. Awaiting licensed wildlife rehabilitator.",
                Pet.ListingType.RESCUE_ALERT,
                Pet.Urgency.CRITICAL,
                "Window collision stun, slight wing droop",
                "Austin, TX",
                30.2680,
                -97.7420,
                List.of(
                        "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80"
                )
        );

        seedPetWithPhotos(
                spotter,
                "Displaced River Turtle",
                Pet.Species.REPTILE,
                "Red-eared Slider",
                48,
                Pet.PetGender.UNKNOWN,
                Pet.PetSize.SMALL,
                "Crossed over MoPac frontage road barrier away from water. Moved to safe grass embankment. Needs relocation to protected creek basin.",
                Pet.ListingType.RESCUE_ALERT,
                Pet.Urgency.HIGH,
                "Shell intact, active and responsive",
                "Austin, TX",
                30.2600,
                -97.7700,
                List.of(
                        "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=800&q=80"
                )
        );

        // 5. Seed Demo Adopters, Swipes, Matches and Real-time Messages
        User adopterSarah = userRepository.findByEmail("sarah.adopter@meaowmatch.org").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("sarah.adopter@meaowmatch.org")
                        .passwordHash(encodedPassword)
                        .role(User.UserRole.ADOPTER)
                        .fullName("Sarah Jenkins")
                        .phone("+1-512-555-0201")
                        .city("Austin, TX")
                        .latitude(30.2672)
                        .longitude(-97.7431)
                        .status("ACTIVE")
                        .build())
        );

        if (matchRepository.count() == 0) {
            Match matchLuna = matchRepository.save(Match.builder()
                    .user1(shelterHaven)
                    .user2(adopterSarah)
                    .pet(luna)
                    .matchType("ADOPTION")
                    .isActive(true)
                    .build());

            messageRepository.save(Message.builder()
                    .match(matchLuna)
                    .sender(adopterSarah)
                    .content("Hi Austin Haven! I fell in love with Luna from her profile. Is she still available for adoption?")
                    .isRead(true)
                    .build());

            messageRepository.save(Message.builder()
                    .match(matchLuna)
                    .sender(shelterHaven)
                    .content("Hello Sarah! Yes, Luna is available and doing great. She loves people and purrs whenever anyone sits near her.")
                    .isRead(true)
                    .build());

            messageRepository.save(Message.builder()
                    .match(matchLuna)
                    .sender(adopterSarah)
                    .content("That warms my heart! Could I visit her this Saturday around 2:00 PM?")
                    .isRead(true)
                    .build());

            messageRepository.save(Message.builder()
                    .match(matchLuna)
                    .sender(shelterHaven)
                    .content("Saturday at 2:00 PM is perfect! We have put you on our calendar. We are at 4200 S Congress Ave, Austin. See you soon!")
                    .isRead(false)
                    .build());

            Match matchBarnaby = matchRepository.save(Match.builder()
                    .user1(shelterHillCountry)
                    .user2(adopterSarah)
                    .pet(barnaby)
                    .matchType("ADOPTION")
                    .isActive(true)
                    .build());

            messageRepository.save(Message.builder()
                    .match(matchBarnaby)
                    .sender(shelterHillCountry)
                    .content("Hi Sarah! Barnaby matched with your profile. We noticed you enjoy hiking – he is the ultimate trail buddy!")
                    .isRead(true)
                    .build());

            messageRepository.save(Message.builder()
                    .match(matchBarnaby)
                    .sender(adopterSarah)
                    .content("Hi! Yes, I hike the Greenbelt every weekend! How is he on the leash?")
                    .isRead(false)
                    .build());

            swipeRepository.save(Swipe.builder()
                    .user(adopterSarah)
                    .pet(luna)
                    .swipeType(Swipe.SwipeType.LIKE)
                    .build());

            swipeRepository.save(Swipe.builder()
                    .user(adopterSarah)
                    .pet(barnaby)
                    .swipeType(Swipe.SwipeType.LIKE)
                    .build());
        }

        log.info("[DatabaseSeeder] Successfully seeded {} pets and associated photos into PostgreSQL database.", petRepository.count());
    }

    private Pet seedPetWithPhotos(
            User owner,
            String name,
            Pet.Species species,
            String breed,
            int ageMonths,
            Pet.PetGender gender,
            Pet.PetSize size,
            String description,
            Pet.ListingType listingType,
            Pet.Urgency urgency,
            String healthStatus,
            String city,
            double latitude,
            double longitude,
            List<String> photoUrls
    ) {
        Pet pet = petRepository.save(Pet.builder()
                .owner(owner)
                .name(name)
                .species(species)
                .breed(breed)
                .ageMonths(ageMonths)
                .gender(gender)
                .size(size)
                .description(description)
                .listingType(listingType)
                .urgency(urgency)
                .healthStatus(healthStatus)
                .status(Pet.PetStatus.AVAILABLE)
                .city(city)
                .latitude(latitude)
                .longitude(longitude)
                .build());

        for (int i = 0; i < photoUrls.size(); i++) {
            petPhotoRepository.save(PetPhoto.builder()
                    .pet(pet)
                    .photoUrl(photoUrls.get(i))
                    .displayOrder(i)
                    .isPrimary(i == 0)
                    .build());
        }
        return pet;
    }
}
