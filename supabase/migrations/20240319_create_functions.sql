-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_table_schema(text);
DROP FUNCTION IF EXISTS get_tables();

-- Create function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(p_table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES')::boolean,
    c.column_default::text
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = 'public' 
    AND c.table_name = p_table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_table_schema(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_tables() TO anon, authenticated;

