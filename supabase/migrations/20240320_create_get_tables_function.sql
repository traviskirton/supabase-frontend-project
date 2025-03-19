-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_tables();

-- Create function to get all tables
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (tablename text) AS $$
BEGIN
  RETURN QUERY
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
END;
$$ LANGUAGE plpgsql;

