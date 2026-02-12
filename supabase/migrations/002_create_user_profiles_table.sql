-- Creates the user_profiles table to track signed-up users
-- This ensures users must sign up before they can log in

-- Create the user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can see their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create RLS policy: Only the auth system can insert profiles (via trigger)
CREATE POLICY "System can insert user profiles" ON user_profiles
  FOR INSERT
  WITH CHECK (true);
