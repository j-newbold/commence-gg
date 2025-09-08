import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl: string = (process.env.SUPABASE_URL as string);
const anonKey: string = (process.env.ANON_KEY as string);

export const supabase = createClient(
    supabaseUrl,
    anonKey
)