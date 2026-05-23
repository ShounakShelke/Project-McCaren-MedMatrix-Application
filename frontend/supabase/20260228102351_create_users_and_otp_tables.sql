/*
  # Create Users and OTP Verification Tables

  ## New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Unique user identifier
  - `full_name` (text, required) - User's full name
  - `phone_number` (text, unique, required) - User's phone number
  - `age` (integer, optional) - User's age
  - `gender` (text, optional) - User's gender
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `otp_codes`
  - `id` (uuid, primary key) - Unique OTP record identifier
  - `phone_number` (text, required) - Phone number associated with OTP
  - `otp_code` (text, required) - The OTP code
  - `expires_at` (timestamptz, required) - OTP expiration time
  - `verified` (boolean) - Whether OTP has been verified
  - `created_at` (timestamptz) - OTP creation timestamp

  ## Security
  
  1. Enable RLS on both tables
  2. Users can read and update their own data
  3. OTP codes can be created by anyone (for signup/login)
  4. OTP codes can be verified by anyone (but expire after 10 minutes)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone_number text UNIQUE NOT NULL,
  age integer,
  gender text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create otp_codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (phone_number = current_setting('app.phone_number', true));

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (phone_number = current_setting('app.phone_number', true))
  WITH CHECK (phone_number = current_setting('app.phone_number', true));

CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- OTP codes policies
CREATE POLICY "Anyone can create OTP codes"
  ON otp_codes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read OTP codes for verification"
  ON otp_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update OTP codes for verification"
  ON otp_codes
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster phone number lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_number ON otp_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
