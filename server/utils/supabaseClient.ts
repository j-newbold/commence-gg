const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.ANON_KEY
)