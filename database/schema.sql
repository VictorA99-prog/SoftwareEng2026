/*
  Sunset Vinyl — Database Schema (BE-04)

  This file documents:
  1. Current Supabase tables already in use by the application
  2. The finalized Item/Product model
  3. Proposed tables for orders, order items, and discount codes
     (commented out for team review before implementation)

  NOTE:
  - Customer/user accounts are managed by Supabase Auth (auth.users)
  - No statements in this file are auto-run
*/

-- =========================================================
-- EXISTING TABLES (Already in Supabase)
-- =========================================================

-- Products table
-- Used by frontend shop + backend /products endpoints
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  artist TEXT,
  description TEXT,
  price DOUBLE PRECISION,
  quantity BIGINT,
  image_url TEXT,
  category TEXT, -- vinyl 
  genre TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

-- Vinyls table (legacy / reference)
-- Some vinyl data exists here, but products is the primary table
CREATE TABLE vinyls (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

-- Admins table
-- Used for admin access control
CREATE TABLE admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL
);

-- =========================================================
-- AUTHENTICATION (Supabase Managed)
-- =========================================================

-- Users/customers are stored in Supabase Auth
-- Table: auth.users
-- Primary key: auth.users.id (UUID)

-- This ID will be referenced by orders.user_id

-- =========================================================
-- PROPOSED TABLES (NOT YET CREATED)
-- =========================================================

-- Orders table
-- Represents a completed checkout
/*
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- references auth.users.id
  total_price DOUBLE PRECISION NOT NULL,
  tax DOUBLE PRECISION NOT NULL,
  discount_code TEXT,
  status TEXT, -- pending | completed | cancelled
  created_at TIMESTAMPTZ DEFAULT now()
);
*/

-- Order items table
-- Individual products inside an order
/*
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DOUBLE PRECISION NOT NULL
);
*/

-- Discount codes table
/*
CREATE TABLE discount_codes (
  code TEXT PRIMARY KEY,
  percentage INT,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ
);
*/