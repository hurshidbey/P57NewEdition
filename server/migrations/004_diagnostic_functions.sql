-- Function to find users with missing metadata
CREATE OR REPLACE FUNCTION public.get_users_with_missing_metadata()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  provider TEXT,
  missing_fields TEXT[]
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_app_meta_data->>'provider' as provider,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN u.raw_user_meta_data->>'tier' IS NULL THEN 'tier' END,
      CASE WHEN u.raw_user_meta_data->>'name' IS NULL THEN 'name' END
    ], NULL) as missing_fields
  FROM auth.users u
  WHERE 
    u.raw_user_meta_data->>'tier' IS NULL OR
    u.raw_user_meta_data->>'name' IS NULL
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze payment success rates
CREATE OR REPLACE FUNCTION public.get_payment_success_metrics(
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  payment_method TEXT,
  total_transactions BIGINT,
  completed BIGINT,
  failed BIGINT,
  pending BIGINT,
  success_rate NUMERIC,
  average_completion_time INTERVAL,
  total_revenue NUMERIC
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.payment_method,
    COUNT(*)::BIGINT as total_transactions,
    COUNT(*) FILTER (WHERE pt.status = 'completed')::BIGINT as completed,
    COUNT(*) FILTER (WHERE pt.status = 'failed')::BIGINT as failed,
    COUNT(*) FILTER (WHERE pt.status IN ('pending', 'processing'))::BIGINT as pending,
    ROUND(
      COUNT(*) FILTER (WHERE pt.status = 'completed')::NUMERIC / 
      NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
      2
    ) as success_rate,
    AVG(pt.completed_at - pt.created_at) FILTER (WHERE pt.status = 'completed') as average_completion_time,
    SUM(pt.final_amount) FILTER (WHERE pt.status = 'completed') as total_revenue
  FROM public.payment_transactions pt
  WHERE pt.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY pt.payment_method
  ORDER BY total_transactions DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to find potential duplicate payments
CREATE OR REPLACE FUNCTION public.find_duplicate_payments(
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  payment_count BIGINT,
  total_amount NUMERIC,
  payment_ids UUID[],
  created_dates TIMESTAMP WITH TIME ZONE[]
)
AS $$
BEGIN
  RETURN QUERY
  WITH recent_payments AS (
    SELECT 
      pt.user_id,
      pt.user_email,
      pt.id,
      pt.final_amount,
      pt.created_at
    FROM public.payment_transactions pt
    WHERE 
      pt.status = 'completed' AND
      pt.created_at >= NOW() - (p_hours || ' hours')::INTERVAL
  ),
  duplicate_candidates AS (
    SELECT 
      rp.user_id,
      rp.user_email,
      COUNT(*) as payment_count,
      SUM(rp.final_amount) as total_amount,
      ARRAY_AGG(rp.id ORDER BY rp.created_at) as payment_ids,
      ARRAY_AGG(rp.created_at ORDER BY rp.created_at) as created_dates
    FROM recent_payments rp
    GROUP BY rp.user_id, rp.user_email
    HAVING COUNT(*) > 1
  )
  SELECT * FROM duplicate_candidates
  ORDER BY payment_count DESC, total_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get OAuth provider statistics
CREATE OR REPLACE FUNCTION public.get_oauth_provider_stats()
RETURNS TABLE (
  provider TEXT,
  total_users BIGINT,
  users_with_metadata BIGINT,
  users_without_metadata BIGINT,
  metadata_completion_rate NUMERIC,
  paid_users BIGINT,
  conversion_rate NUMERIC
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(u.raw_app_meta_data->>'provider', 'email') as provider,
    COUNT(*)::BIGINT as total_users,
    COUNT(*) FILTER (
      WHERE u.raw_user_meta_data->>'tier' IS NOT NULL 
      AND u.raw_user_meta_data->>'name' IS NOT NULL
    )::BIGINT as users_with_metadata,
    COUNT(*) FILTER (
      WHERE u.raw_user_meta_data->>'tier' IS NULL 
      OR u.raw_user_meta_data->>'name' IS NULL
    )::BIGINT as users_without_metadata,
    ROUND(
      COUNT(*) FILTER (
        WHERE u.raw_user_meta_data->>'tier' IS NOT NULL 
        AND u.raw_user_meta_data->>'name' IS NOT NULL
      )::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0) * 100,
      2
    ) as metadata_completion_rate,
    COUNT(*) FILTER (WHERE u.raw_user_meta_data->>'tier' = 'paid')::BIGINT as paid_users,
    ROUND(
      COUNT(*) FILTER (WHERE u.raw_user_meta_data->>'tier' = 'paid')::NUMERIC / 
      NULLIF(COUNT(*)::NUMERIC, 0) * 100,
      2
    ) as conversion_rate
  FROM auth.users u
  GROUP BY provider
  ORDER BY total_users DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_users_with_missing_metadata() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_payment_success_metrics(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.find_duplicate_payments(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_oauth_provider_stats() TO service_role;