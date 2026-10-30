-- ==============================================================================
-- Migration: V2__meaowmatch_schema.sql
-- Description: MeaowMatch Pet Adoption & Emergency Rescue Platform Schema
-- ==============================================================================

-- 1. Extend Users Table with Role, Name, Phone, and Location
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'ADOPTER';
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Pets Table (Adoption Listings, Foster Listings & Emergency Rescue Alerts)
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(30) NOT NULL CHECK (species IN ('DOG', 'CAT', 'BIRD', 'REPTILE', 'SMALL_ANIMAL', 'OTHER')),
    breed VARCHAR(100),
    age_months INT,
    gender VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN' CHECK (gender IN ('MALE', 'FEMALE', 'UNKNOWN')),
    size VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (size IN ('SMALL', 'MEDIUM', 'LARGE')),
    description TEXT,
    listing_type VARCHAR(30) NOT NULL DEFAULT 'ADOPTION' CHECK (listing_type IN ('ADOPTION', 'FOSTER', 'RESCUE_ALERT')),
    urgency VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (urgency IN ('NORMAL', 'HIGH', 'CRITICAL')),
    health_status TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PENDING', 'ADOPTED', 'RESCUED')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pet Photos Table
CREATE TABLE IF NOT EXISTS pet_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pet Swipes / Adoption Inquiries (Adopter swipes on pets)
CREATE TABLE IF NOT EXISTS pet_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    swipe_type VARCHAR(10) NOT NULL CHECK (swipe_type IN ('LIKE', 'PASS')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_pet UNIQUE (user_id, pet_id)
);

-- 5. Extend Matches Table with Pet Reference
ALTER TABLE matches ADD COLUMN IF NOT EXISTS pet_id UUID REFERENCES pets(id) ON DELETE SET NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_type VARCHAR(30) NOT NULL DEFAULT 'ADOPTION';

-- Indices for MeaowMatch Performance & Haversine Distance
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_listing_type ON pets(listing_type);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_urgency ON pets(urgency);
CREATE INDEX IF NOT EXISTS idx_pets_geo ON pets(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pet_photos_pet ON pet_photos(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_swipes_user ON pet_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_swipes_pet ON pet_swipes(pet_id);
CREATE INDEX IF NOT EXISTS idx_matches_pet ON matches(pet_id);
