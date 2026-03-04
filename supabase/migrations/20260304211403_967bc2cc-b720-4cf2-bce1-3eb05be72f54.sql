
-- Drop the security definer view and replace with a regular function
DROP VIEW IF EXISTS public.monthly_stats;

-- Create a regular SQL function instead (inherits caller's RLS)
CREATE OR REPLACE FUNCTION public.get_monthly_stats(p_user_id UUID)
RETURNS TABLE (
  month TIMESTAMPTZ,
  total_income NUMERIC,
  total_expenses NUMERIC,
  net_result NUMERIC,
  transaction_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    DATE_TRUNC('month', date) AS month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) AS total_expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -ABS(amount) END) AS net_result,
    COUNT(*) AS transaction_count
  FROM public.transactions
  WHERE user_id = p_user_id
  GROUP BY DATE_TRUNC('month', date)
  ORDER BY month DESC;
$$;
