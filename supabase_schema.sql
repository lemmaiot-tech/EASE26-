-- SQL for Supabase Editor

-- 1. Wedding Settings Table
CREATE TABLE "EASE-settings" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  groom_name TEXT DEFAULT 'Emmanuel',
  bride_name TEXT DEFAULT 'Esther',
  wedding_date TIMESTAMP WITH TIME ZONE DEFAULT '2026-07-11T10:00:00Z',
  engagement_time TEXT DEFAULT '7:30 AM',
  church_service_time TEXT DEFAULT '11:00 AM',
  venue_name TEXT DEFAULT 'Miracles-Link Word Ministries Intl.',
  venue_address TEXT DEFAULT 'Behinde Nepa''s Quaters, Araromi, Oyo',
  reception_details TEXT DEFAULT 'Location on Access Card',
  hashtag TEXT DEFAULT '#EASE''26',
  rsvp_deadline TEXT DEFAULT 'June 25th, 2026',
  rsvp_phones TEXT[] DEFAULT ARRAY['08023650289', '07018712196', '09039244218'],
  hero_image_url TEXT,
  background_image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial settings
INSERT INTO "EASE-settings" (id) VALUES (uuid_generate_v4());

-- 2. Gallery Table
CREATE TABLE "EASE-gallery" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. RSVP Table
CREATE TABLE "EASE-rsvp" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending TEXT NOT NULL,
  guests INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE "EASE-settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EASE-gallery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EASE-rsvp" ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow public read, admin write)
-- Note: In a real app, you'd use Supabase Auth for the admin. 
-- For this demo, we'll allow public read and assume admin uses a secret key or we'll bypass RLS for simplicity in this sandbox if needed, 
-- but better to set up basic policies.

CREATE POLICY "Allow public read on settings" ON "EASE-settings" FOR SELECT USING (true);
CREATE POLICY "Allow public read on gallery" ON "EASE-gallery" FOR SELECT USING (true);
CREATE POLICY "Allow public read on rsvp" ON "EASE-rsvp" FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rsvp" ON "EASE-rsvp" FOR INSERT WITH CHECK (true);

-- Admin policies (Simplified for demo - in production use proper auth)
CREATE POLICY "Allow all on settings for authenticated" ON "EASE-settings" FOR ALL USING (true);
CREATE POLICY "Allow all on gallery for authenticated" ON "EASE-gallery" FOR ALL USING (true);
CREATE POLICY "Allow all on rsvp for authenticated" ON "EASE-rsvp" FOR ALL USING (true);
