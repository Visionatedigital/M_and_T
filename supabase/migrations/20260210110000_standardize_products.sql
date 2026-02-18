
-- 1. Rename 'Bodaboda Group Loan' to 'Group Loan'
UPDATE loan_products
SET name = 'Group Loan'
WHERE name = 'Bodaboda Group Loan';

-- 2. Ensure 'Individual Loan' exists
INSERT INTO loan_products (name, interest_rate, duration_months, status)
SELECT 'Individual Loan', 0.30, 4, 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM loan_products WHERE name = 'Individual Loan'
);

-- 3. Update existing loan applications
UPDATE loan_applications
SET loan_product = 'Group Loan'
WHERE loan_product = 'Bodaboda Group Loan';
