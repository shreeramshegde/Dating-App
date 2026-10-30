-- ==============================================================================
-- Migration: V1__meaowmatch_schema.sql
-- Description: Clean, Production-Grade MeaowMatch Database Schema
-- Platform: Pet Adoption & Emergency Animal Rescue Network
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Clean up any legacy dating tables if they exist
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS profile_photos CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;

-- 1. Users Table (Adopters, Rehomers/Shelters, and Emergency Rescuers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADOPTER' CHECK (role IN ('ADOPTER', 'REHOMER', 'RESCUER')),
    full_name VARCHAR(100),
    phone VARCHAR(50),
    city VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Pets Table (Adoptable Companions, Fosters, and Emergency Distress Reports)
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

-- 3. Pet Photos Table (Linked to Object Storage / S3 / Pre-Signed URLs)
CREATE TABLE IF NOT EXISTS pet_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pet Swipes / Inquiries (Adopters swiping LIKE or PASS on Pets)
CREATE TABLE IF NOT EXISTS pet_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    swipe_type VARCHAR(10) NOT NULL CHECK (swipe_type IN ('LIKE', 'PASS')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_pet UNIQUE (user_id, pet_id)
);

-- 5. Matches Table (Adoption Connections & Emergency Rescue Coordination Channels)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    match_type VARCHAR(30) NOT NULL DEFAULT 'ADOPTION' CHECK (match_type IN ('ADOPTION', 'RESCUE')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_order CHECK (user1_id != user2_id)
);

-- 6. Messages Table (Real-Time STOMP WebSocket Messaging)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Blocks Table
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_blocker_blocked UNIQUE (blocker_id, blocked_id)
);

-- Production Performance & Geo-Discovery Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pets_owner ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_listing_type ON pets(listing_type);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_urgency ON pets(urgency);
CREATE INDEX IF NOT EXISTS idx_pets_geo ON pets(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pet_photos_pet ON pet_photos(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_swipes_user ON pet_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_swipes_pet ON pet_swipes(pet_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_pet ON matches(pet_id);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
