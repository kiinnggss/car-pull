-- CAR PULL: Mobile-First Commuter & Roadside Resilience PWA
-- Database Schema & PostGIS Spatial Engine Specification
-- Location: /src/lib/db/schema.sql

-- Enable PostGIS and UUID extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS & DOMAIN TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('commuter_rider', 'commuter_driver', 'mechanic', 'tow_operator');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'undisclosed');
CREATE TYPE drivetrain_type AS ENUM ('FWD', 'RWD', 'AWD', '4WD');
CREATE TYPE vehicle_category AS ENUM ('sedan', 'suv', 'van', 'flatbed_tow', 'wheel_lift_tow', 'mechanic_bike');
CREATE TYPE safe_zone_type AS ENUM ('fuel_station', 'shopping_mall', 'gated_estate_gate', 'bank_premises');
CREATE TYPE match_status AS ENUM ('swiped_right', 'counter_offered', 'locked', 'cancelled', 'in_transit', 'completed');
CREATE TYPE incident_type AS ENUM ('flat_tyre', 'dead_battery', 'engine_overheating', 'total_mechanical_tow');
CREATE TYPE incident_status AS ENUM ('beacon_fired', 'bidding_open', 'operator_assigned', 'en_route', 'on_site', 'resolved', 'cancelled');

-- ============================================================================
-- 2. USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    gender gender_type NOT NULL DEFAULT 'undisclosed',
    bvn_hash VARCHAR(64) NOT NULL,
    nin_hash VARCHAR(64) NOT NULL,
    kyc_status verification_status DEFAULT 'verified',
    is_female_commute_only BOOLEAN DEFAULT FALSE,
    employer_domain VARCHAR(100),
    alumni_tag VARCHAR(100),
    community_estate_name VARCHAR(150),
    saas_subscription_active BOOLEAN DEFAULT TRUE,
    saas_subscription_expires_at TIMESTAMP WITH TIME ZONE,
    rating_score NUMERIC(3, 2) DEFAULT 5.00,
    trips_completed INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. VEHICLES (FOR COMMUTERS & TOW OPERATORS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30) NOT NULL,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    category vehicle_category NOT NULL,
    drivetrain drivetrain_type NOT NULL,
    has_active_ac BOOLEAN DEFAULT TRUE,
    lacvis_cert_url TEXT,
    lasdri_card_url TEXT,
    insurance_policy_number VARCHAR(100),
    verified_by_admin BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. SAFE-ZONE WAYPOINTS (ANTI-AGBERO OFF-STREET GEOFENCED NODES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS safe_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    zone_type safe_zone_type NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_safe_zones_location ON safe_zones USING GIST (location);

-- ============================================================================
-- 5. DRIVER COMMUTE CORRIDORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS corridors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    origin_name VARCHAR(150) NOT NULL,
    destination_name VARCHAR(150) NOT NULL,
    origin_location GEOGRAPHY(Point, 4326) NOT NULL,
    destination_location GEOGRAPHY(Point, 4326) NOT NULL,
    route_polyline GEOGRAPHY(LineString, 4326) NOT NULL,
    departure_time TIME NOT NULL,
    available_seats INT NOT NULL CHECK (available_seats > 0),
    fuel_split_per_seat_ngn INT NOT NULL,
    ac_surcharge_ngn INT DEFAULT 0,
    is_recurring_weekly BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_corridors_polyline ON corridors USING GIST (route_polyline);

-- ============================================================================
-- 6. COMMUTE MATCHES & BIDDING ESCROW
-- ============================================================================

CREATE TABLE IF NOT EXISTS commute_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    corridor_id UUID REFERENCES corridors(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pickup_safezone_id UUID REFERENCES safe_zones(id),
    dropoff_safezone_id UUID REFERENCES safe_zones(id),
    final_agreed_fare_ngn INT NOT NULL,
    has_ac_included BOOLEAN DEFAULT TRUE,
    escrow_reference VARCHAR(100) UNIQUE,
    status match_status DEFAULT 'swiped_right',
    scheduled_for DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. EMERGENCY INCIDENTS & DISPATCH
-- ============================================================================

CREATE TABLE IF NOT EXISTS emergency_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commuter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    incident_type incident_type NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    location_address_description TEXT NOT NULL,
    assigned_provider_id UUID REFERENCES users(id),
    escrow_amount_ngn INT NOT NULL,
    escrow_held BOOLEAN DEFAULT FALSE,
    escrow_released BOOLEAN DEFAULT FALSE,
    status incident_status DEFAULT 'beacon_fired',
    assistance_shield_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_location ON emergency_incidents USING GIST (location);

-- ============================================================================
-- 8. PROVIDER SERVICE OFFERS (EMERGENCY BIDS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS emergency_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES emergency_incidents(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quote_amount_ngn INT NOT NULL,
    estimated_arrival_minutes INT NOT NULL,
    equipment_verified BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. SPATIAL CORRIDOR MATCHING FUNCTION (500M BUFFER & DIRECTIONAL CHECK)
-- ============================================================================

CREATE OR REPLACE FUNCTION match_riders_to_corridors(
    p_pickup_lat DOUBLE PRECISION,
    p_pickup_lng DOUBLE PRECISION,
    p_dropoff_lat DOUBLE PRECISION,
    p_dropoff_lng DOUBLE PRECISION,
    p_max_walk_meters DOUBLE PRECISION DEFAULT 500.0
)
RETURNS TABLE (
    corridor_id UUID,
    driver_id UUID,
    fuel_split_per_seat_ngn INT,
    pickup_distance_meters DOUBLE PRECISION,
    dropoff_distance_meters DOUBLE PRECISION
) AS $$
DECLARE
    v_pickup GEOGRAPHY := ST_SetSRID(ST_MakePoint(p_pickup_lng, p_pickup_lat), 4326);
    v_dropoff GEOGRAPHY := ST_SetSRID(ST_MakePoint(p_dropoff_lng, p_dropoff_lat), 4326);
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS corridor_id,
        c.driver_id,
        c.fuel_split_per_seat_ngn,
        ST_Distance(c.route_polyline, v_pickup) AS pickup_distance_meters,
        ST_Distance(c.route_polyline, v_dropoff) AS dropoff_distance_meters
    FROM corridors c
    WHERE c.is_active = TRUE
      AND c.available_seats > 0
      AND ST_DWithin(c.route_polyline, v_pickup, p_max_walk_meters)
      AND ST_DWithin(c.route_polyline, v_dropoff, p_max_walk_meters)
      -- Ensure flow matches corridor direction: pickup happens before drop-off along the line
      AND ST_LineLocatePoint(c.route_polyline::geometry, v_pickup::geometry) < 
          ST_LineLocatePoint(c.route_polyline::geometry, v_dropoff::geometry)
    ORDER BY pickup_distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. ROADSIDE DISPATCH SPATIAL SCORING FUNCTION
-- Incorporates traffic-weighted ETA, median barrier U-turn penalties, and hazard zones
-- ============================================================================

CREATE OR REPLACE FUNCTION score_roadside_providers(
    p_incident_id UUID,
    p_incident_lat DOUBLE PRECISION,
    p_incident_lng DOUBLE PRECISION,
    p_incident_type incident_type,
    p_commuter_drivetrain drivetrain_type
)
RETURNS TABLE (
    provider_id UUID,
    final_score DOUBLE PRECISION,
    eta_traffic_minutes INT,
    uturn_penalty DOUBLE PRECISION,
    hazard_multiplier DOUBLE PRECISION,
    equipment_compatible BOOLEAN
) AS $$
DECLARE
    v_incident_point GEOGRAPHY := ST_SetSRID(ST_MakePoint(p_incident_lng, p_incident_lat), 4326);
BEGIN
    RETURN QUERY
    SELECT
        p.id AS provider_id,
        (
            0.50 * b.estimated_arrival_minutes +
            0.20 * (CASE WHEN ST_Distance(v.location, v_incident_point) > 2000 THEN 20.0 ELSE 0.0 END) +
            0.15 * (10.0 - (u.rating_score * 2.0)) +
            0.15 * 15.0 -- Expressway shoulder hazard multiplier
        ) AS final_score,
        b.estimated_arrival_minutes AS eta_traffic_minutes,
        (CASE WHEN ST_Distance(v.location, v_incident_point) > 2000 THEN 20.0 ELSE 0.0 END) AS uturn_penalty,
        15.0 AS hazard_multiplier,
        (CASE 
            WHEN (p_commuter_drivetrain IN ('AWD', '4WD') AND p_incident_type = 'total_mechanical_tow') 
                 THEN v.category = 'flatbed_tow'
            WHEN (p_incident_type = 'total_mechanical_tow') 
                 THEN v.category != 'mechanic_bike'
            ELSE TRUE
        END) AS equipment_compatible
    FROM emergency_bids b
    JOIN users u ON u.id = b.provider_id
    JOIN vehicles v ON v.owner_id = u.id
    WHERE b.incident_id = p_incident_id
    ORDER BY final_score ASC;
END;
$$ LANGUAGE plpgsql;
