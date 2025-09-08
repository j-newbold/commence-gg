import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.ANON_KEY;
export const supabase = createClient(supabaseUrl, anonKey);
