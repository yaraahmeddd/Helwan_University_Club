-- ============================================================================
-- DATABASE MIGRATION: Add Parking Request Fields to Bookings
-- ============================================================================
-- Purpose: Store whether a court booking needs car parking and how many cars
-- Date: 2026-06-11
-- ============================================================================

BEGIN;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS uses_parking BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS parking_cars_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN bookings.uses_parking IS 'Whether the booking owner requested parking area access';
COMMENT ON COLUMN bookings.parking_cars_count IS 'Number of cars requested for parking area access';

ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS chk_bookings_parking_cars_count;

ALTER TABLE bookings
ADD CONSTRAINT chk_bookings_parking_cars_count
CHECK (
  (uses_parking = false AND parking_cars_count = 0)
  OR
  (uses_parking = true AND parking_cars_count >= 1)
);

CREATE INDEX IF NOT EXISTS idx_bookings_uses_parking
ON bookings(uses_parking)
WHERE uses_parking = true;

COMMIT;
