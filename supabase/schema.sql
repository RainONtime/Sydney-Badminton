-- =============================================================================
-- Duoduo Badminton — Full Schema
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()


-- ---------------------------------------------------------------------------
-- 1. organizers
--    Admin & organizer accounts. Passwords stored in plaintext for now.
--    TODO(security): migrate to Supabase Auth + hashed credentials before
--    going live with real users. The current client-side password-match
--    approach exposes passwords to anyone with the anon key.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  password    TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'organizer'
                          CHECK (role IN ('super', 'organizer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: login lookup is password-based, passwords must not collide
CREATE UNIQUE INDEX IF NOT EXISTS organizers_password_idx ON organizers (password);


-- ---------------------------------------------------------------------------
-- 2. events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id     UUID         REFERENCES organizers(id) ON DELETE SET NULL,

  title            TEXT         NOT NULL,
  description      TEXT,
  date             DATE         NOT NULL,
  start_time       TIME         NOT NULL,
  end_time         TIME,
  location         TEXT         NOT NULL,
  max_participants INTEGER      NOT NULL DEFAULT 20 CHECK (max_participants > 0),
  price            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),

  -- Denormalised display name (avoids a JOIN on every public event load)
  organizer        TEXT,
  organizer_wechat TEXT,

  -- Payment configuration
  -- Empty array  → free event (price should also be 0)
  -- ['wechat']   → WeChat QR only
  -- ['bank']     → bank transfer only
  -- ['wechat','bank'] → registrant picks one at checkout
  payment_methods  TEXT[]       NOT NULL DEFAULT '{}',
  wechat_qr        TEXT,          -- Supabase Storage URL (or NULL)
  -- Displayed large + bold on the registrant payment screen
  wechat_note      TEXT,
  payid            TEXT,
  account_name     TEXT,
  bsb              TEXT,
  account_number   TEXT,

  status           TEXT         NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_organizer_id_idx ON events (organizer_id);
CREATE INDEX IF NOT EXISTS events_status_idx       ON events (status);
CREATE INDEX IF NOT EXISTS events_date_idx         ON events (date);


-- ---------------------------------------------------------------------------
-- 3. registrations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID         NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  -- Optional link to auth.users; NULL for guest registrations
  user_id             UUID         REFERENCES auth.users(id) ON DELETE SET NULL,

  name                TEXT         NOT NULL,
  gender              TEXT         NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  skill_level         TEXT         CHECK (skill_level IN ('1','2','3','4','5','6')),
  quantity            INTEGER      NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 3),
  notes               TEXT,

  payment_status      TEXT         NOT NULL DEFAULT 'pending'
                                   CHECK (payment_status IN ('pending','confirmed','rejected','waitlisted')),
  -- Supabase Storage URL; NULL until the user uploads a screenshot
  payment_screenshot  TEXT,

  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registrations_event_id_idx      ON registrations (event_id);
CREATE INDEX IF NOT EXISTS registrations_payment_status_idx ON registrations (payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id        ON registrations (user_id);


-- =============================================================================
-- Row Level Security
-- =============================================================================
-- Current posture: anon key can do everything.
-- This is intentional while we run the app without Supabase Auth.
--
-- TODO(security): once Supabase Auth is wired up —
--   • organizers SELECT/INSERT/UPDATE/DELETE → authenticated + role check via JWT claim
--   • events INSERT/UPDATE/DELETE → authenticated organizer who owns the row
--   • registrations UPDATE/DELETE → authenticated organizer who owns the event
--   • Keep organizers.password off the SELECT list for non-admin roles
-- =============================================================================

ALTER TABLE organizers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- organizers: anon needs SELECT for password-based login lookup
-- TODO: restrict to authenticated only once Auth is implemented
CREATE POLICY "organizers_anon_all" ON organizers
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- events: fully open for now (admin writes use the anon key)
-- TODO: split into public SELECT + authenticated INSERT/UPDATE/DELETE
CREATE POLICY "events_anon_all" ON events
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- registrations: public registration + admin management, all via anon key
-- TODO: restrict UPDATE/DELETE to authenticated organizers
CREATE POLICY "registrations_anon_all" ON registrations
  FOR ALL TO anon USING (true) WITH CHECK (true);


-- =============================================================================
-- Storage Bucket
-- =============================================================================
-- Create via Supabase Dashboard → Storage → New bucket:
--   Name:   payment_screenshots
--   Public: false  (presigned URLs for upload; public read for confirmed only)
--
-- Or run in SQL Editor:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('payment_screenshots', 'payment_screenshots', false)
-- ON CONFLICT (id) DO NOTHING;
--
-- TODO: add storage RLS policies that allow:
--   • anon INSERT (registrant uploads screenshot)
--   • authenticated SELECT (organizer reviews screenshot)


-- =============================================================================
-- Seed: super admin
-- Change the password before deploying to production!
-- =============================================================================
INSERT INTO organizers (name, password, role)
VALUES ('超级管理员', 'super2024', 'super')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- User Profiles (Supabase Auth integration)
-- Run this block AFTER enabling Supabase Auth in your project.
-- =============================================================================

-- 4. user_profiles — one row per auth.users entry
CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url   TEXT,
  gender       TEXT         CHECK (gender IN ('male', 'female', 'other')),
  contact_info TEXT,
  skill_level  TEXT         CHECK (skill_level IN ('1','2','3','4','5','6')),
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger: auto-create profile on first sign-up (Google OAuth or email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      '羽毛球爱好者'
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =============================================================================
-- Migration: extend user_profiles with badminton-specific fields
-- Run this block in Supabase SQL Editor if the table already exists.
-- Safe to re-run (IF NOT EXISTS guards).
-- =============================================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS gender       TEXT CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS contact_info TEXT,
  ADD COLUMN IF NOT EXISTS skill_level  TEXT CHECK (skill_level IN ('1','2','3','4','5','6'));

-- =============================================================================
-- Migration: add user_id FK to registrations (links logged-in users to their bookings)
-- Run this block in Supabase SQL Editor if the table already exists.
-- Safe to re-run (IF NOT EXISTS guards).
-- =============================================================================
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations (user_id);
