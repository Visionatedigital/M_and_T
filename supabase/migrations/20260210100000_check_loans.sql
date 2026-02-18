
-- Check count of loans by product and status
SELECT 
    loan_product,
    status,
    COUNT(*) as count
FROM 
    loan_applications
GROUP BY 
    loan_product, status
ORDER BY 
    count DESC;

-- Check a few examples of non-group loans that should be active
SELECT 
    id, 
    full_name, 
    loan_product, 
    status, 
    created_at
FROM 
    loan_applications
WHERE 
    loan_product != 'Bodaboda Group Loan'
    AND status IN ('approved', 'disbursed')
LIMIT 5;
