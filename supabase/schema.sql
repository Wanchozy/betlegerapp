-- BetLedger Supabase Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Bets table
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  event TEXT NOT NULL,
  bet_type TEXT NOT NULL DEFAULT 'moneyline',
  odds NUMERIC NOT NULL,
  stake NUMERIC NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'win', 'loss', 'push')),
  profit_loss NUMERIC NOT NULL DEFAULT 0,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX bets_user_id_idx ON bets(user_id);
CREATE INDEX bets_placed_at_idx ON bets(placed_at DESC);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bets"
  ON bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bets"
  ON bets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bets"
  ON bets FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
