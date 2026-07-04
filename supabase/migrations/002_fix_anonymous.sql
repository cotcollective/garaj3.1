-- Fix anonymous consultations
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_user_id_fkey;
ALTER TABLE consultations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS email_captured TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS lead_score TEXT DEFAULT 'froid';
