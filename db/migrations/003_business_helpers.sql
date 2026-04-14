-- =============================================================================
-- Business helper functions
-- =============================================================================
-- PostGIS GEOGRAPHY columns can't be inserted as plain values via PostgREST.
-- These SQL functions wrap the ST_MakePoint conversion so server actions
-- can call supabase.rpc() and get a typed business row back.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_business_with_location(
  p_name TEXT,
  p_slug TEXT,
  p_category_id UUID,
  p_description TEXT,
  p_address JSONB,
  p_longitude DOUBLE PRECISION,
  p_latitude DOUBLE PRECISION,
  p_phone TEXT,
  p_email TEXT,
  p_website TEXT,
  p_operating_hours JSONB
)
RETURNS public.businesses
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_business public.businesses;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.businesses (
    owner_id,
    name,
    slug,
    category_id,
    description,
    address,
    location,
    phone,
    email,
    website,
    operating_hours
  ) VALUES (
    v_user_id,
    p_name,
    p_slug,
    p_category_id,
    NULLIF(p_description, ''),
    p_address,
    CASE
      WHEN p_longitude IS NOT NULL AND p_latitude IS NOT NULL THEN
        ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
      ELSE NULL
    END,
    NULLIF(p_phone, ''),
    NULLIF(p_email, ''),
    NULLIF(p_website, ''),
    p_operating_hours
  )
  RETURNING * INTO v_business;

  RETURN v_business;
END;
$$;


CREATE OR REPLACE FUNCTION public.update_business_with_location(
  p_business_id UUID,
  p_name TEXT,
  p_category_id UUID,
  p_description TEXT,
  p_address JSONB,
  p_longitude DOUBLE PRECISION,
  p_latitude DOUBLE PRECISION,
  p_phone TEXT,
  p_email TEXT,
  p_website TEXT,
  p_operating_hours JSONB
)
RETURNS public.businesses
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_business public.businesses;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.businesses
  SET
    name = p_name,
    category_id = p_category_id,
    description = NULLIF(p_description, ''),
    address = p_address,
    location = CASE
      WHEN p_longitude IS NOT NULL AND p_latitude IS NOT NULL THEN
        ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
      ELSE location
    END,
    phone = NULLIF(p_phone, ''),
    email = NULLIF(p_email, ''),
    website = NULLIF(p_website, ''),
    operating_hours = p_operating_hours
  WHERE id = p_business_id
    AND owner_id = v_user_id
  RETURNING * INTO v_business;

  IF v_business.id IS NULL THEN
    RAISE EXCEPTION 'Business not found or not owned by user';
  END IF;

  RETURN v_business;
END;
$$;
