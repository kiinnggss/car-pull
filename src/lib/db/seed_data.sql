-- CAR PULL: Lagos Corridor Seed Data (Ajah Langbasa -> Victoria Island -> Marina)
-- Location: /src/lib/db/seed_data.sql

-- 1. Insert Safe Zones (Anti-Agbero Geofenced Waypoints)
INSERT INTO safe_zones (id, name, zone_type, address, location) VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'TotalEnergies Mega Station',
    'fuel_station',
    'Opposite Jakande Roundabout, Lekki-Epe Expressway, Lagos',
    ST_SetSRID(ST_MakePoint(3.5186, 6.4428), 4326)::geography
),
(
    '11111111-1111-1111-1111-111111111102',
    'Circle Mall Parking Bay',
    'shopping_mall',
    'Jakande, Lekki, Lagos',
    ST_SetSRID(ST_MakePoint(3.5122, 6.4389), 4326)::geography
),
(
    '11111111-1111-1111-1111-111111111103',
    'VGC Main Gate Security Bay',
    'gated_estate_gate',
    'Victoria Garden City, Lekki-Epe Expressway, Lagos',
    ST_SetSRID(ST_MakePoint(3.5594, 6.4552), 4326)::geography
),
(
    '11111111-1111-1111-1111-111111111104',
    'Mobil Sandfill Station Bay',
    'fuel_station',
    'Sandfill Bus Stop, Lekki Phase 1, Lagos',
    ST_SetSRID(ST_MakePoint(3.4510, 6.4312), 4326)::geography
),
(
    '11111111-1111-1111-1111-111111111105',
    'Eko Hotel Corporate Forecourt',
    'shopping_mall',
    'Ademola Adetokunbo St, Victoria Island, Lagos',
    ST_SetSRID(ST_MakePoint(3.4320, 6.4275), 4326)::geography
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Commuters & Drivers
INSERT INTO users (id, phone_number, email, full_name, avatar_url, gender, bvn_hash, nin_hash, kyc_status, employer_domain, alumni_tag, rating_score, trips_completed) VALUES
(
    '22222222-2222-2222-2222-222222222201',
    '+2348023456789',
    'babatunde.adeleke@flutterwavego.com',
    'Babatunde Adeleke',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'male',
    'hash_bvn_adeleke_881923',
    'hash_nin_adeleke_991823',
    'verified',
    'flutterwavego.com',
    'Babcock University',
    4.95,
    142
),
(
    '22222222-2222-2222-2222-222222222202',
    '+2348039876543',
    'chioma.okonkwo@pwc.com',
    'Chioma Okonkwo',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'female',
    'hash_bvn_okonkwo_338192',
    'hash_nin_okonkwo_772819',
    'verified',
    'pwc.com',
    'University of Lagos',
    4.98,
    89
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Driver Vehicles
INSERT INTO vehicles (id, owner_id, make, model, year, color, plate_number, category, drivetrain, has_active_ac, verified_by_admin) VALUES
(
    '33333333-3333-3333-3333-333333333301',
    '22222222-2222-2222-2222-222222222201',
    'Toyota',
    'Camry',
    2021,
    'Midnight Black',
    'APP-842-EY',
    'sedan',
    'FWD',
    TRUE,
    TRUE
),
(
    '33333333-3333-3333-3333-333333333302',
    '22222222-2222-2222-2222-222222222202',
    'Honda',
    'CR-V',
    2022,
    'Deep Purple',
    'KJA-512-AB',
    'suv',
    'AWD',
    TRUE,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Corridors (Lekki-Epe Expressway Polyline)
INSERT INTO corridors (id, driver_id, vehicle_id, origin_name, destination_name, origin_location, destination_location, route_polyline, departure_time, available_seats, fuel_split_per_seat_ngn, ac_surcharge_ngn) VALUES
(
    '44444444-4444-4444-4444-444444444401',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333301',
    'Ajah Langbasa',
    'Victoria Island (Ademola Adetokunbo)',
    ST_SetSRID(ST_MakePoint(3.5700, 6.4650), 4326)::geography,
    ST_SetSRID(ST_MakePoint(3.4320, 6.4275), 4326)::geography,
    ST_SetSRID(ST_GeomFromText('LINESTRING(3.5700 6.4650, 3.5594 6.4552, 3.5186 6.4428, 3.4800 6.4350, 3.4510 6.4312, 3.4320 6.4275)'), 4326)::geography,
    '06:45:00',
    3,
    2000,
    500
)
ON CONFLICT (id) DO NOTHING;
