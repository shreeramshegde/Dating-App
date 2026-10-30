-- ==============================================================================
-- Migration: V2__seed_meaowmatch_data.sql
-- Description: Production Seed Data for MeaowMatch
-- Inserts Verified Shelters, Multi-Species Pets, Emergency Rescue Alerts,
-- Demo Adopters, Matches, and Real-Time Chat Conversations
-- ==============================================================================

-- 1. Insert Verified Organizations & Rescuers
-- Password for all seed users is: Password123!
-- BCrypt hash: $2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u
INSERT INTO users (id, email, password_hash, role, full_name, phone, city, latitude, longitude)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'austin-haven@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'REHOMER', 'Austin Animal Haven', '+1-512-555-0101', 'Austin, TX', 30.2672, -97.7431),
    ('a0000000-0000-0000-0000-000000000002', 'hill-country@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'REHOMER', 'Hill Country Rescue', '+1-512-555-0102', 'Austin, TX', 30.2849, -97.7341),
    ('a0000000-0000-0000-0000-000000000003', 'foster-network@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'REHOMER', 'Central Texas Foster Network', '+1-512-555-0103', 'Round Rock, TX', 30.5083, -97.6789),
    ('a0000000-0000-0000-0000-000000000004', 'rabbit-sanctuary@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'REHOMER', 'Austin Rabbit Sanctuary', '+1-512-555-0104', 'Austin, TX', 30.2500, -97.7500),
    ('a0000000-0000-0000-0000-000000000005', 'avian-sanctuary@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'REHOMER', 'Lone Star Avian Sanctuary', '+1-512-555-0105', 'Austin, TX', 30.3000, -97.7200),
    ('a0000000-0000-0000-0000-000000000006', 'herp-society@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'REHOMER', 'Austin Herpetological Society', '+1-512-555-0106', 'Cedar Park, TX', 30.5050, -97.8200),
    ('a0000000-0000-0000-0000-000000000007', 'spotter-austin@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'RESCUER', 'Citizen Emergency Spotter', '+1-512-555-0107', 'Austin, TX', 30.2504, -97.7495),
    ('a0000000-0000-0000-0000-000000000010', 'sarah.adopter@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'ADOPTER', 'Sarah Jenkins', '+1-512-555-0201', 'Austin, TX', 30.2672, -97.7431),
    ('a0000000-0000-0000-0000-000000000011', 'alex.adopter@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'ADOPTER', 'Alex Rivera', '+1-512-555-0202', 'Austin, TX', 30.2800, -97.7300),
    ('a0000000-0000-0000-0000-000000000012', 'wildlife-patrol@meaowmatch.org', '$2a$10$wSjO389.tE42Y9BszYg1c.mS.kY16d.4P2p.7n0y76rG9lZ4mF4/u', 'RESCUER', 'Travis County Wildlife Patrol', '+1-512-555-0301', 'Austin, TX', 30.2600, -97.7400)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude;

-- 2. Insert Adoptable Pets (Multi-Species: Dog, Cat, Bird, Reptile, Small Animal)
INSERT INTO pets (id, owner_id, name, species, breed, age_months, gender, size, description, listing_type, urgency, health_status, status, latitude, longitude, city)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Luna', 'CAT', 'Domestic Short Hair', 14, 'FEMALE', 'SMALL', 'Playful, vocal, and deeply affectionate cat. Loves gentle forehead rubs and chirps at birds by the window. Fully vaccinated & litter trained.', 'ADOPTION', 'NORMAL', 'Spayed, Microchipped, FeLV/FIV Negative', 'AVAILABLE', 30.2672, -97.7431, 'Austin, TX'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Barnaby', 'DOG', 'Australian Shepherd Mix', 24, 'MALE', 'MEDIUM', 'High energy, exceptionally smart, and eager to please. Looking for an active household with a yard or someone who loves hiking trails.', 'ADOPTION', 'NORMAL', 'Neutered, Core Vaccinations up to date, Heartworm negative', 'AVAILABLE', 30.2849, -97.7341, 'Austin, TX'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Milo', 'DOG', 'Golden Retriever Mix', 8, 'MALE', 'LARGE', 'Gentle giant in training! Friendly with other dogs, kids, and strangers. Working on basic leash manners.', 'FOSTER', 'HIGH', 'Puppy vaccines completed, Dewormed', 'AVAILABLE', 30.5083, -97.6789, 'Round Rock, TX'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Thumper & Clover', 'SMALL_ANIMAL', 'Holland Lop Bunnies', 18, 'UNKNOWN', 'SMALL', 'Bonded pair of gentle bunnies. Must be adopted together! They enjoy indoor free-roaming and fresh organic cilantro.', 'ADOPTION', 'NORMAL', 'Neutered & Spayed pair', 'AVAILABLE', 30.2500, -97.7500, 'Austin, TX'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Kiwi & Sunny', 'BIRD', 'Peach-faced Lovebirds', 20, 'UNKNOWN', 'SMALL', 'Sweet, inquisitive lovebird pair. They sing soft melodic whistles in the morning and love crunching on millet sprays and apple slices.', 'ADOPTION', 'NORMAL', 'Avian vet check completed, Beak & Feather healthy', 'AVAILABLE', 30.3000, -97.7200, 'Austin, TX'),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'Ziggy', 'REPTILE', 'Central Bearded Dragon', 36, 'MALE', 'MEDIUM', 'Very docile, loves basking under warm UV lamps and sitting on shoulders while you read. Enjoys collard greens and dubia roaches.', 'ADOPTION', 'NORMAL', 'Healthy calcium levels, sheds smoothly', 'AVAILABLE', 30.5050, -97.8200, 'Cedar Park, TX'),
    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Oliver', 'CAT', 'Maine Coon Mix', 30, 'MALE', 'MEDIUM', 'Fluffy, polydactyl sweetheart with a deep purr. Gets along well with calm dogs and enjoys sleeping at the foot of the bed.', 'ADOPTION', 'NORMAL', 'Neutered, Microchipped, Vaccinations current', 'AVAILABLE', 30.2700, -97.7400, 'Austin, TX'),
    ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'Bella', 'DOG', 'Corgi Mix', 15, 'FEMALE', 'SMALL', 'Spirited, smiling, and compact companion. Loves fetch, squeaky balls, and learning new agility tricks. Great with children.', 'ADOPTION', 'NORMAL', 'Spayed, Vaccinated, Monthly flea/tick preventive', 'AVAILABLE', 30.2900, -97.7500, 'Austin, TX')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Emergency Rescue Alerts (Animals in Distress)
INSERT INTO pets (id, owner_id, name, species, breed, age_months, gender, size, description, listing_type, urgency, health_status, status, latitude, longitude, city)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007', 'Injured Calico Stray', 'CAT', 'Domestic Calico', 12, 'FEMALE', 'SMALL', 'Limping on front right paw near South Congress food trailers. Appears frightened but approachable. Needs immediate transport to Austin Animal Clinic.', 'RESCUE_ALERT', 'CRITICAL', 'Front paw injury, dehydration suspected', 'AVAILABLE', 30.2504, -97.7495, 'Austin, TX'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 'Abandoned Senior Terrier', 'DOG', 'Terrier Mix', 84, 'MALE', 'SMALL', 'Found wandering near Walnut Creek Park trailhead without collar or microchip. Very calm and docile. Needs temporary foster or shelter intake.', 'RESCUE_ALERT', 'HIGH', 'Mild cataract, no visible open wounds', 'AVAILABLE', 30.4011, -97.6974, 'Austin, TX'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', 'Disoriented Urban Songbird', 'BIRD', 'Native Songbird', 6, 'UNKNOWN', 'SMALL', 'Window strike collision near 6th and Congress office plaza. Breathing rapidly, kept safe in a ventilated cardboard box. Awaiting licensed wildlife rehabilitator.', 'RESCUE_ALERT', 'CRITICAL', 'Window collision stun, slight wing droop', 'AVAILABLE', 30.2680, -97.7420, 'Austin, TX'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', 'Displaced River Turtle', 'REPTILE', 'Red-eared Slider', 48, 'UNKNOWN', 'SMALL', 'Crossed over MoPac frontage road barrier away from water. Moved to safe grass embankment. Needs relocation to protected creek basin.', 'RESCUE_ALERT', 'HIGH', 'Shell intact, active and responsive', 'AVAILABLE', 30.2600, -97.7700, 'Austin, TX')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert High-Resolution Pet Photos (Stored directly in database records & mirrored in S3)
INSERT INTO pet_photos (id, pet_id, photo_url, display_order, is_primary)
VALUES
    -- Luna (Cat)
    ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', 0, true),
    ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80', 1, false),

    -- Barnaby (Dog)
    ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80', 0, true),
    ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80', 1, false),

    -- Milo (Dog - Foster)
    ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80', 0, true),

    -- Thumper & Clover (Small Animal - Bunnies)
    ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80', 0, true),

    -- Kiwi & Sunny (Bird - Lovebirds)
    ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80', 0, true),

    -- Ziggy (Reptile - Bearded Dragon)
    ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&w=800&q=80', 0, true),

    -- Oliver (Cat - Maine Coon)
    ('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80', 0, true),

    -- Bella (Dog - Corgi Mix)
    ('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=800&q=80', 0, true),

    -- Photos for Emergency Rescue Alerts
    ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80', 0, true),
    ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80', 0, true),
    ('d0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=800&q=80', 0, true),
    ('d0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=800&q=80', 0, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Swipes for Demo Adopter
INSERT INTO pet_swipes (id, user_id, pet_id, swipe_type)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'LIKE'),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'LIKE')
ON CONFLICT (user_id, pet_id) DO NOTHING;

-- 6. Seed Matches
INSERT INTO matches (id, user1_id, user2_id, pet_id, match_type, is_active)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'ADOPTION', true),
    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'ADOPTION', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Real Chat Messages
INSERT INTO messages (id, match_id, sender_id, content, is_read, sent_at)
VALUES
    ('90000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'Hi Austin Haven! I fell in love with Luna from her profile. Is she still available for adoption?', true, NOW() - INTERVAL '2 hours'),
    ('90000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Hello Sarah! Yes, Luna is available and doing great. She loves people and purrs whenever anyone sits near her.', true, NOW() - INTERVAL '90 minutes'),
    ('90000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000010', 'That warms my heart! Could I visit her this Saturday around 2:00 PM?', true, NOW() - INTERVAL '45 minutes'),
    ('90000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Saturday at 2:00 PM is perfect! We have put you on our calendar. We are at 4200 S Congress Ave, Austin. See you soon!', false, NOW() - INTERVAL '10 minutes'),
    ('90000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Hi Sarah! Barnaby matched with your profile. We noticed you enjoy hiking – he is the ultimate trail buddy!', true, NOW() - INTERVAL '3 hours'),
    ('90000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000010', 'Hi! Yes, I hike the Greenbelt every weekend! How is he on the leash?', false, NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;
