-- Transactions (Escrow) Table
-- This table tracks escrow transactions for secure payments

-- ===========================================
-- TRANSACTION STATUS TYPE
-- ===========================================
CREATE TYPE transaction_status AS ENUM ('escrow_pending', 'funds_secured', 'shipped', 'completed');

-- ===========================================
-- TRANSACTIONS TABLE
-- ===========================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in ZAR cents
  status transaction_status DEFAULT 'escrow_pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Buyer and seller can view their transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyer can create transactions
CREATE POLICY "Buyers can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyer and seller can update transaction status (depending on state)
CREATE POLICY "Participants can update transaction status"
  ON transactions FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_listing ON transactions(listing_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ===========================================
-- UPDATED_AT TRIGGER
-- ===========================================
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
