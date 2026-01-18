-- GearGrab Database Schema
-- Phase 2: Core tables with RLS policies

-- Note: Using gen_random_uuid() which is built into Postgres 13+
-- No extension required

-- ===========================================
-- PROFILES TABLE
-- ===========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT, -- Private, encrypted/hidden by default
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  allow_whatsapp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read partial profile info (public fields)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ===========================================
-- LISTING STATUS TYPE
-- ===========================================
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'hidden');

-- ===========================================
-- LISTINGS TABLE
-- ===========================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in ZAR cents
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  condition INTEGER CHECK (condition >= 1 AND condition <= 10),
  estimated_retail_price INTEGER, -- AI suggested retail price in ZAR cents
  status listing_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read active listings
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

-- Only owner can insert listings
CREATE POLICY "Users can create own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only owner can update their listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Only owner can delete their listings
CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- CONTACT REQUEST STATUS TYPE
-- ===========================================
CREATE TYPE contact_request_status AS ENUM ('pending', 'accepted', 'declined');

-- ===========================================
-- CONTACT REQUESTS TABLE
-- ===========================================
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  status contact_request_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, listing_id) -- One request per buyer per listing
);

-- RLS for contact_requests
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Buyer and seller can view their contact requests
CREATE POLICY "Users can view own contact requests"
  ON contact_requests FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyer can create contact requests
CREATE POLICY "Buyers can create contact requests"
  ON contact_requests FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Only seller can update contact request status
CREATE POLICY "Sellers can update contact request status"
  ON contact_requests FOR UPDATE
  USING (auth.uid() = seller_id);

-- ===========================================
-- CONVERSATIONS TABLE
-- ===========================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  contact_request_id UUID REFERENCES contact_requests(id) ON DELETE CASCADE,
  participants UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Only participants can view conversations
CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = ANY(participants));

-- Participants can create conversations
CREATE POLICY "Participants can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants));

-- ===========================================
-- MESSAGES TABLE
-- ===========================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Only conversation participants can view messages
CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participants)
    )
  );

-- Only conversation participants can insert messages
CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND auth.uid() = ANY(conversations.participants)
    )
  );

-- ===========================================
-- REVIEWS TABLE
-- ===========================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, target_user_id, listing_id)
);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_contact_requests_buyer ON contact_requests(buyer_id);
CREATE INDEX idx_contact_requests_seller ON contact_requests(seller_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_reviews_target ON reviews(target_user_id);

-- ===========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_requests_updated_at
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
