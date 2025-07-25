-- Migration: Add atomic coupon operations
-- This migration creates database functions for atomic coupon operations to prevent race conditions

-- Function to atomically validate and use a coupon
CREATE OR REPLACE FUNCTION public.use_coupon_atomic(
  p_coupon_code TEXT,
  p_user_id UUID,
  p_user_email TEXT,
  p_payment_id TEXT,
  p_original_amount INTEGER,
  p_discount_amount INTEGER,
  p_final_amount INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  coupon_id INTEGER,
  discount_type TEXT,
  discount_value INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon RECORD;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Start transaction with proper isolation level
  -- This ensures we get a consistent view of the coupon data
  
  -- Lock the coupon row for update to prevent concurrent modifications
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(code) = UPPER(p_coupon_code)
    AND is_active = true
  FOR UPDATE;
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Coupon not found or inactive'::TEXT,
      NULL::INTEGER,
      NULL::TEXT,
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Check validity dates
  IF v_coupon.valid_from IS NOT NULL AND v_coupon.valid_from > v_now THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Coupon is not yet valid'::TEXT,
      v_coupon.id,
      v_coupon.discount_type,
      v_coupon.discount_value;
    RETURN;
  END IF;
  
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < v_now THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Coupon has expired'::TEXT,
      v_coupon.id,
      v_coupon.discount_type,
      v_coupon.discount_value;
    RETURN;
  END IF;
  
  -- Check usage limits
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Coupon usage limit reached'::TEXT,
      v_coupon.id,
      v_coupon.discount_type,
      v_coupon.discount_value;
    RETURN;
  END IF;
  
  -- All checks passed, increment usage count atomically
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = v_coupon.id;
  
  -- Record the usage
  INSERT INTO public.coupon_usages (
    coupon_id,
    user_id,
    user_email,
    payment_id,
    original_amount,
    discount_amount,
    final_amount,
    used_at
  ) VALUES (
    v_coupon.id,
    p_user_id,
    p_user_email,
    p_payment_id,
    p_original_amount,
    p_discount_amount,
    p_final_amount,
    v_now
  );
  
  -- Return success
  RETURN QUERY SELECT 
    true::BOOLEAN,
    'Coupon applied successfully'::TEXT,
    v_coupon.id,
    v_coupon.discount_type,
    v_coupon.discount_value;
END;
$$;

-- Function to validate a coupon without using it
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_coupon_code TEXT,
  p_amount INTEGER DEFAULT NULL
)
RETURNS TABLE (
  valid BOOLEAN,
  message TEXT,
  coupon_id INTEGER,
  discount_type TEXT,
  discount_value INTEGER,
  original_price INTEGER,
  discount_amount INTEGER,
  final_amount INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon RECORD;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_discount_amount INTEGER;
  v_final_amount INTEGER;
  v_amount INTEGER;
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(code) = UPPER(p_coupon_code)
    AND is_active = true;
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Coupon not found or inactive'::TEXT,
      NULL::INTEGER,
      NULL::TEXT,
      NULL::INTEGER,
      NULL::INTEGER,
      NULL::INTEGER,
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Check validity dates
  IF v_coupon.valid_from IS NOT NULL AND v_coupon.valid_from > v_now THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Coupon is not yet valid'::TEXT,
      v_coupon.id,
      v_coupon.discount_type,
      v_coupon.discount_value,
      v_coupon.original_price,
      NULL::INTEGER,
      NULL::INTEGER;
    RETURN;
  END IF;
  
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < v_now THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Coupon has expired'::TEXT,
      v_coupon.id,
      v_coupon.discount_type,
      v_coupon.discount_value,
      v_coupon.original_price,
      NULL::INTEGER,
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Check usage limits
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      'Coupon usage limit reached'::TEXT,
      v_coupon.id,
      v_coupon.discount_type,
      v_coupon.discount_value,
      v_coupon.original_price,
      NULL::INTEGER,
      NULL::INTEGER;
    RETURN;
  END IF;
  
  -- Calculate discount if amount provided
  v_amount := COALESCE(p_amount, v_coupon.original_price);
  
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount_amount := FLOOR(v_amount * (v_coupon.discount_value / 100.0));
  ELSE -- fixed
    v_discount_amount := LEAST(v_coupon.discount_value, v_amount);
  END IF;
  
  v_final_amount := v_amount - v_discount_amount;
  
  -- Return success
  RETURN QUERY SELECT 
    true::BOOLEAN,
    'Coupon is valid'::TEXT,
    v_coupon.id,
    v_coupon.discount_type,
    v_coupon.discount_value,
    v_coupon.original_price,
    v_discount_amount,
    v_final_amount;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.use_coupon_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_coupon_atomic TO anon;
GRANT EXECUTE ON FUNCTION public.validate_coupon TO anon;