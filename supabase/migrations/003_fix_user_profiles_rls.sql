-- Fix user_profiles RLS policy to allow users to insert their own profile

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert user profiles" ON user_profiles;

-- Add the correct policy
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
