-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
CREATE TABLE IF NOT EXISTS feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID,
  text       TEXT NOT NULL,
  rating     SMALLINT,
  page       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
