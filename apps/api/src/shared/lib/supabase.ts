import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? 'https://jzjydzyapwtrpjwgdjnq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Advertencia: Faltan las variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
}

export const supabaseClient = createClient(supabaseUrl, supabaseKey);