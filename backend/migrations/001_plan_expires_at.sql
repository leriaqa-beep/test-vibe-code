-- Migration 001: Add plan_expires_at to users table
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- After running, the admin dashboard will show premium expiry dates
-- and the "Дать Premium" button will set a 30-day expiry automatically.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz DEFAULT NULL;

-- Optional: index for expiry queries (e.g. finding expired premium users)
CREATE INDEX IF NOT EXISTS idx_users_plan_expires_at ON users (plan_expires_at)
  WHERE plan_expires_at IS NOT NULL;
