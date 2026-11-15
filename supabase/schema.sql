-- =============================================================================
-- Prosenjit Mondol — Portfolio CMS · Supabase Schema
-- =============================================================================
-- Run this entire file in the Supabase SQL Editor (project → SQL Editor →
-- New query → paste → Run).
--
-- Design rules:
--   • Every table gets:  id, created_at, updated_at
--   • RLS is ON for every table
--   • anon role gets SELECT only (safe to expose the anon key in the frontend)
--   • authenticated role gets ALL only when jwt email = admin email
--   • No passwords or secrets in this file
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
-- pgcrypto / gen_random_uuid() is already enabled in Supabase by default,
-- but we guard it here just in case.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ---------------------------------------------------------------------------
-- 1. SHARED TRIGGER FUNCTION — keep updated_at fresh on every UPDATE
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- 2. TABLES
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 2.01  about
-- One row that holds the owner's identity / bio information.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS about (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL,

  name             TEXT,
  nickname         TEXT,
  title            TEXT,
  bio              TEXT,
  open_to          TEXT,          -- e.g. "Research / Internship"
  cgpa             TEXT,
  credits_completed TEXT,
  honor            TEXT,
  lab_role         TEXT,
  lab_affiliation  TEXT,
  lab_url          TEXT,
  email            TEXT,
  phone            TEXT,
  portfolio_url    TEXT
);

CREATE OR REPLACE TRIGGER trg_about_updated_at
  BEFORE UPDATE ON about
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.02  news
-- Recent updates / announcements displayed on the portfolio.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS news (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  date          TEXT,
  title         TEXT,
  content       TEXT,
  tags          TEXT[],
  image_url     TEXT,
  status        TEXT        DEFAULT 'published',   -- 'published' | 'draft'
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_news_status        ON news (status);
CREATE INDEX IF NOT EXISTS idx_news_display_order ON news (display_order);

CREATE OR REPLACE TRIGGER trg_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.03  experience
-- Work / research experience entries.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experience (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  role          TEXT,
  organization  TEXT,
  org_url       TEXT,
  location      TEXT,
  period_start  TEXT,
  period_end    TEXT,        -- NULL or 'Present' for ongoing
  description   TEXT,
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_experience_display_order ON experience (display_order);

CREATE OR REPLACE TRIGGER trg_experience_updated_at
  BEFORE UPDATE ON experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.04  education
-- Academic qualifications.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS education (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  degree        TEXT,
  institution   TEXT,
  inst_url      TEXT,
  location      TEXT,
  period        TEXT,
  gpa           TEXT,
  honor         TEXT,
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_education_display_order ON education (display_order);

CREATE OR REPLACE TRIGGER trg_education_updated_at
  BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.05  publications
-- Research papers, preprints, conference / journal articles.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS publications (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

  title           TEXT,
  venue           TEXT,
  status          TEXT,          -- e.g. 'Published', 'Under Review', 'Preprint'
  publisher       TEXT,
  url             TEXT,
  author_position TEXT,          -- e.g. '1st author', '2nd author'
  poster_url      TEXT,
  notes           TEXT,
  year            INT,
  openreview_url  TEXT,
  display_order   INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_publications_status        ON publications (status);
CREATE INDEX IF NOT EXISTS idx_publications_display_order ON publications (display_order);

CREATE OR REPLACE TRIGGER trg_publications_updated_at
  BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.06  projects
-- Portfolio projects with links and metadata.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  name          TEXT,
  icon          TEXT,          -- emoji or icon identifier
  description   TEXT,
  tags          TEXT[],
  github_url    TEXT,
  demo_url      TEXT,
  live_url      TEXT,
  awards        TEXT,
  image_url     TEXT,
  status        TEXT        DEFAULT 'published',   -- 'published' | 'draft'
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_projects_status        ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects (display_order);

CREATE OR REPLACE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.07  skills
-- Skill categories with a list of items per category.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  category      TEXT,
  items         TEXT[],
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_skills_display_order ON skills (display_order);

CREATE OR REPLACE TRIGGER trg_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.08  awards
-- Honors, recognitions, and achievements.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS awards (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  title         TEXT,
  description   TEXT,
  year          INT,
  url           TEXT,
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_awards_display_order ON awards (display_order);

CREATE OR REPLACE TRIGGER trg_awards_updated_at
  BEFORE UPDATE ON awards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.09  certificates
-- Professional or academic certificates with optional file attachment.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  label         TEXT,
  file_url      TEXT,          -- URL in Supabase Storage (portfolio-pdfs bucket)
  type          TEXT,          -- e.g. 'course', 'competition', 'workshop'
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_certificates_display_order ON certificates (display_order);

CREATE OR REPLACE TRIGGER trg_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.10  competitive_programming
-- Online judge / CP platform profiles.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competitive_programming (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  platform      TEXT,
  handle        TEXT,
  url           TEXT,
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cp_display_order ON competitive_programming (display_order);

CREATE OR REPLACE TRIGGER trg_competitive_programming_updated_at
  BEFORE UPDATE ON competitive_programming
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.11  cp_meta
-- Aggregate competitive-programming stats and NASA Space Apps info.
-- Typically one row.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cp_meta (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL,

  problems_solved  TEXT,
  nasa_team        TEXT,
  nasa_role        TEXT,
  nasa_project     TEXT,
  nasa_location    TEXT,
  nasa_track       TEXT
);

CREATE OR REPLACE TRIGGER trg_cp_meta_updated_at
  BEFORE UPDATE ON cp_meta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.12  contests
-- Programming contests / competitions participated in.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contests (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  name          TEXT,
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_contests_display_order ON contests (display_order);

CREATE OR REPLACE TRIGGER trg_contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.13  hackathons
-- Hackathon participations with team and result details.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hackathons (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  name          TEXT,
  team          TEXT,
  role          TEXT,
  location      TEXT,
  year          INT,
  description   TEXT,
  tags          TEXT[],
  links         JSONB,         -- { "devpost": "...", "github": "...", ... }
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hackathons_display_order ON hackathons (display_order);

CREATE OR REPLACE TRIGGER trg_hackathons_updated_at
  BEFORE UPDATE ON hackathons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.14  coursework
-- Academic courses grouped by category.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coursework (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  category      TEXT,
  courses       TEXT[],
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_coursework_display_order ON coursework (display_order);

CREATE OR REPLACE TRIGGER trg_coursework_updated_at
  BEFORE UPDATE ON coursework
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.15  contact_profiles
-- Social, academic, and professional profile links shown on the contact page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_profiles (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  platform      TEXT,
  label         TEXT,
  url           TEXT,
  handle        TEXT,
  icon          TEXT,
  color         TEXT,
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_contact_profiles_display_order ON contact_profiles (display_order);

CREATE OR REPLACE TRIGGER trg_contact_profiles_updated_at
  BEFORE UPDATE ON contact_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.16  volunteering
-- Volunteer / community service activities.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteering (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  org           TEXT,
  role          TEXT,
  period        TEXT,
  description   TEXT,
  tags          TEXT[],
  display_order INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_volunteering_display_order ON volunteering (display_order);

CREATE OR REPLACE TRIGGER trg_volunteering_updated_at
  BEFORE UPDATE ON volunteering
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.17  media
-- Embedded videos, demos, or other media items.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT now() NOT NULL,

  title          TEXT,
  url            TEXT,
  type           TEXT        DEFAULT 'video',   -- 'video' | 'image' | 'embed'
  thumbnail_url  TEXT,
  display_order  INT         DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_media_display_order ON media (display_order);

CREATE OR REPLACE TRIGGER trg_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------------------------------------------------------------------------
-- 2.18  activity_log
-- Audit trail of admin actions (no updated_at — append-only by design).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,

  action       TEXT,          -- e.g. 'INSERT', 'UPDATE', 'DELETE'
  section      TEXT,          -- table / section name
  description  TEXT,
  performed_by TEXT           -- email of the actor
);

-- No updated_at trigger (append-only log).


-- =============================================================================
-- 3. ROW-LEVEL SECURITY
-- =============================================================================
-- Pattern applied to every table:
--   • anon  → SELECT only (read-only public access)
--   • authenticated → ALL, but only when the JWT's email is the admin's email
--
-- The anon key can safely be shipped in frontend JS; it cannot write anything.
-- =============================================================================


-- Helper macro (comment): to disable RLS temporarily for a migration run as
-- service_role, set search_path = public and bypass_rls = on in the session.


-- about -----------------------------------------------------------------------
ALTER TABLE about ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON about
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON about
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- news ------------------------------------------------------------------------
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON news
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON news
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- experience ------------------------------------------------------------------
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON experience
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON experience
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- education -------------------------------------------------------------------
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON education
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON education
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- publications ----------------------------------------------------------------
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON publications
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON publications
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- projects --------------------------------------------------------------------
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON projects
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON projects
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- skills ----------------------------------------------------------------------
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON skills
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON skills
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- awards ----------------------------------------------------------------------
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON awards
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON awards
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- certificates ----------------------------------------------------------------
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON certificates
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON certificates
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- competitive_programming -----------------------------------------------------
ALTER TABLE competitive_programming ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON competitive_programming
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON competitive_programming
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- cp_meta ---------------------------------------------------------------------
ALTER TABLE cp_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON cp_meta
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON cp_meta
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- contests --------------------------------------------------------------------
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON contests
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON contests
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- hackathons ------------------------------------------------------------------
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON hackathons
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON hackathons
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- coursework ------------------------------------------------------------------
ALTER TABLE coursework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON coursework
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON coursework
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- contact_profiles ------------------------------------------------------------
ALTER TABLE contact_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON contact_profiles
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON contact_profiles
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- volunteering ----------------------------------------------------------------
ALTER TABLE volunteering ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON volunteering
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON volunteering
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- media -----------------------------------------------------------------------
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON media
  FOR SELECT TO anon USING (true);

CREATE POLICY "admin_all" ON media
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- activity_log ----------------------------------------------------------------
-- anon cannot read the audit log; only the admin can.
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all" ON activity_log
  FOR ALL TO authenticated
  USING      (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'prosenjit1156@gmail.com');


-- =============================================================================
-- 4. SUPABASE STORAGE BUCKETS  (manual steps — cannot be created via SQL)
-- =============================================================================
--
-- Create the following buckets in the Supabase Dashboard:
--   Storage → New bucket
--
--   Bucket 1: portfolio-media
--     • Public bucket: YES  (images served directly by CDN URL)
--     • Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, video/mp4
--     • Max file size: 10 MB  (10485760 bytes)
--
--   Bucket 2: portfolio-pdfs
--     • Public bucket: YES  (certificate PDFs served by CDN URL)
--     • Allowed MIME types: application/pdf
--     • Max file size: 20 MB  (20971520 bytes)
--
-- After creating the buckets, add Storage RLS policies:
--
--   For portfolio-media:
--     SELECT  → anon        USING (true)
--     INSERT  → authenticated USING (auth.jwt()->>'email' = 'prosenjit1156@gmail.com')
--     UPDATE  → authenticated USING (auth.jwt()->>'email' = 'prosenjit1156@gmail.com')
--     DELETE  → authenticated USING (auth.jwt()->>'email' = 'prosenjit1156@gmail.com')
--
--   For portfolio-pdfs: same policies as above.
--
-- You can also set these policies from Storage → <bucket> → Policies in the
-- Supabase Dashboard, or via the Supabase CLI:
--   supabase storage create-bucket portfolio-media --public
--   supabase storage create-bucket portfolio-pdfs  --public
-- =============================================================================


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
