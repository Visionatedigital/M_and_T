
-- Add location fields to loan_applications table
ALTER TABLE loan_applications
ADD COLUMN IF NOT EXISTS latitude float8,
ADD COLUMN IF NOT EXISTS longitude float8;
