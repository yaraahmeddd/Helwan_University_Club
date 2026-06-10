-- Add court-booking flag for sports admin table
ALTER TABLE sports
ADD COLUMN IF NOT EXISTS requires_booking BOOLEAN NOT NULL DEFAULT FALSE;
