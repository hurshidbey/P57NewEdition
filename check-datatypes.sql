-- Check data types of the columns
SELECT 
    c1.column_name as payment_column,
    c1.data_type as payment_type,
    c2.column_name as user_column, 
    c2.data_type as user_type
FROM information_schema.columns c1
CROSS JOIN information_schema.columns c2
WHERE c1.table_schema = 'public' 
    AND c1.table_name = 'payment_transactions' 
    AND c1.column_name = 'user_id'
    AND c2.table_schema = 'auth' 
    AND c2.table_name = 'users' 
    AND c2.column_name = 'id';