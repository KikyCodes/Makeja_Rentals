-- Roommate extended columns migration
-- Run this in Supabase SQL editor

ALTER TABLE roommate_posts
  ADD COLUMN IF NOT EXISTS age SMALLINT,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male','female','other')),
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS university TEXT,
  ADD COLUMN IF NOT EXISTS smoking_pref TEXT DEFAULT 'no' CHECK (smoking_pref IN ('yes','no','occasionally','outside_only')),
  ADD COLUMN IF NOT EXISTS drinking_pref TEXT DEFAULT 'no' CHECK (drinking_pref IN ('yes','no','occasionally')),
  ADD COLUMN IF NOT EXISTS pets_pref TEXT DEFAULT 'no' CHECK (pets_pref IN ('yes','no','small_pets')),
  ADD COLUMN IF NOT EXISTS cleanliness TEXT DEFAULT 'clean' CHECK (cleanliness IN ('very_clean','clean','moderate','relaxed')),
  ADD COLUMN IF NOT EXISTS sleep_schedule TEXT DEFAULT 'flexible' CHECK (sleep_schedule IN ('early_bird','night_owl','flexible')),
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS messages_count INTEGER DEFAULT 0;

-- Roommate direct messaging table
CREATE TABLE IF NOT EXISTS roommate_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES roommate_posts(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roommate_messages_receiver ON roommate_messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roommate_messages_sender ON roommate_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_roommate_messages_post ON roommate_messages(post_id);

ALTER TABLE roommate_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any before recreating
DROP POLICY IF EXISTS "rm_msg_participant_select" ON roommate_messages;
DROP POLICY IF EXISTS "rm_msg_sender_insert" ON roommate_messages;
DROP POLICY IF EXISTS "rm_msg_receiver_update" ON roommate_messages;

CREATE POLICY "rm_msg_participant_select" ON roommate_messages
  FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "rm_msg_sender_insert" ON roommate_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "rm_msg_receiver_update" ON roommate_messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Function to increment messages_count on roommate_posts
CREATE OR REPLACE FUNCTION increment_roommate_messages_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    UPDATE roommate_posts SET messages_count = messages_count + 1 WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_roommate_messages_count ON roommate_messages;
CREATE TRIGGER trg_increment_roommate_messages_count
  AFTER INSERT ON roommate_messages
  FOR EACH ROW EXECUTE FUNCTION increment_roommate_messages_count();
