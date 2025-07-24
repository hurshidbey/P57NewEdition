-- Create payment_transactions table to properly track payment state
-- This solves the issue of losing track of payments for OAuth users
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  
  -- Transaction details
  merchant_trans_id TEXT UNIQUE NOT NULL, -- Our internal transaction ID
  external_trans_id TEXT, -- Payment provider's transaction ID (Click/Atmos)
  payment_method TEXT NOT NULL CHECK (payment_method IN ('click', 'atmos')),
  
  -- Amount details
  original_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'UZS',
  
  -- Coupon tracking
  coupon_id INTEGER REFERENCES public.coupons(id),
  coupon_code TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  CONSTRAINT positive_amounts CHECK (
    original_amount > 0 AND 
    final_amount >= 0 AND 
    discount_amount >= 0
  )
);

-- Create indexes for fast lookups
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);
CREATE INDEX idx_payment_transactions_external_trans_id ON public.payment_transactions(external_trans_id) WHERE external_trans_id IS NOT NULL;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_payment_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_transaction_updated_at();

-- Function to complete a payment transaction and update user tier
CREATE OR REPLACE FUNCTION public.complete_payment_transaction(
  p_transaction_id UUID,
  p_external_trans_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_transaction RECORD;
  v_user RECORD;
  v_result JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Lock the transaction row for update
    SELECT * INTO v_transaction
    FROM public.payment_transactions
    WHERE id = p_transaction_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Transaction not found'
      );
    END IF;
    
    IF v_transaction.status != 'pending' AND v_transaction.status != 'processing' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Transaction already processed',
        'status', v_transaction.status
      );
    END IF;
    
    -- Update transaction status
    UPDATE public.payment_transactions
    SET 
      status = 'completed',
      external_trans_id = COALESCE(p_external_trans_id, external_trans_id),
      completed_at = NOW()
    WHERE id = p_transaction_id;
    
    -- Get user details
    SELECT * INTO v_user
    FROM auth.users
    WHERE id = v_transaction.user_id;
    
    IF FOUND THEN
      -- Update user tier to paid
      UPDATE auth.users
      SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
          'tier', 'paid',
          'paidAt', NOW(),
          'paymentMethod', v_transaction.payment_method,
          'lastPaymentId', v_transaction.id
        )
      WHERE id = v_transaction.user_id
        AND (raw_user_meta_data->>'tier' IS NULL OR raw_user_meta_data->>'tier' != 'paid');
      
      -- Update coupon usage if applicable
      IF v_transaction.coupon_id IS NOT NULL THEN
        UPDATE public.coupons
        SET used_count = used_count + 1
        WHERE id = v_transaction.coupon_id;
        
        -- Record coupon usage
        INSERT INTO public.coupon_usage (
          coupon_id,
          user_id,
          user_email,
          payment_id,
          original_amount,
          discount_amount,
          final_amount,
          used_at
        ) VALUES (
          v_transaction.coupon_id,
          v_transaction.user_id,
          v_transaction.user_email,
          v_transaction.merchant_trans_id,
          v_transaction.original_amount,
          v_transaction.discount_amount,
          v_transaction.final_amount,
          NOW()
        );
      END IF;
    END IF;
    
    -- Build success response
    v_result := jsonb_build_object(
      'success', true,
      'transaction_id', v_transaction.id,
      'user_id', v_transaction.user_id,
      'user_email', v_transaction.user_email,
      'amount', v_transaction.final_amount,
      'status', 'completed'
    );
    
    RETURN v_result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback and return error
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.complete_payment_transaction(UUID, TEXT) TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.payment_transactions TO service_role;

-- Create view for admin dashboard
CREATE OR REPLACE VIEW public.payment_transactions_summary AS
SELECT 
  pt.*,
  u.email as auth_user_email,
  u.raw_user_meta_data->>'name' as user_name,
  u.raw_user_meta_data->>'tier' as user_tier,
  c.code as coupon_code_used,
  c.discount_type as coupon_type,
  c.discount_value as coupon_value
FROM public.payment_transactions pt
LEFT JOIN auth.users u ON pt.user_id = u.id
LEFT JOIN public.coupons c ON pt.coupon_id = c.id
ORDER BY pt.created_at DESC;

-- Grant read access to the view
GRANT SELECT ON public.payment_transactions_summary TO service_role;