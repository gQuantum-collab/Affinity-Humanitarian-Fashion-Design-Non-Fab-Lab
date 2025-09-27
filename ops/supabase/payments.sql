-- payments.sql
-- Idempotent creation of payments table for recording Stripe webhook events

CREATE TABLE IF NOT EXISTS public.payments (
  id bigserial PRIMARY KEY,
  stripe_id text UNIQUE,
  amount integer,
  currency text,
  status text,
  metadata jsonb,
  raw_event jsonb,
  created_at timestamptz DEFAULT now()
);

-- allow admin inserts (we'll assume server-side operations use service role)
