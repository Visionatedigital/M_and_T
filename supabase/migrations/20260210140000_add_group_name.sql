
-- Add group_name to loan_applications to store legacy group labels (e.g., 'Kapere', 'Single')
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Index for faster filtering and aggregation
CREATE INDEX IF NOT EXISTS idx_loan_applications_group_name ON loan_applications(group_name);
