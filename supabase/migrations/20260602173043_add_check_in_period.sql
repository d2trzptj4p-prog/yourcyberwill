-- Add check_in_interval_days column to profiles table
-- Allows users to customize their check-in period (1m for testing, 14, 30, 90, 180, 365 days)
-- Defaults to 30 days if not specified

ALTER TABLE profiles ADD COLUMN check_in_interval_days INTEGER DEFAULT 30;

-- Add constraint to ensure only valid periods are stored
-- 1 = 1 minute testing period; 14-365 = production periods
ALTER TABLE profiles ADD CONSTRAINT valid_check_in_period CHECK (
  check_in_interval_days IN (1, 14, 30, 90, 180, 365)
);
