// Basic file for returning the supabase client

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import { createClient } from '@supabase/supabase-js'; // Supabase client for database interactions

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client created successfully');

export { supabase };