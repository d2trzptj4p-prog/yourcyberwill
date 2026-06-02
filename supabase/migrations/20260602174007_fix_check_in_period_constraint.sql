-- Fix check_in_period constraint to include testing value (1 minute)
-- Drop the old constraint and create a new one that includes 1

ALTER TABLE profiles DROP CONSTRAINT valid_check_in_period;

-- Add new constraint that includes 1 for testing
ALTER TABLE profiles ADD CONSTRAINT valid_check_in_period CHECK (
  check_in_interval_days IN (1, 14, 30, 90, 180, 365)
);
