import { createClient } from '@supabase/supabase-js';

// Leitura prioritária de import.meta.env com substituição estática do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hpcwsrrahkzidbuzwgmj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwY3dzcnJhaGt6aWRidXp3Z21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMTU5MjAsImV4cCI6MjEwNTU5MTkyMH0.-SUDqNzS4P9_W7vb7wxg_IZXge5hK7SbxmY5QWTVQd4';

// Validação com console.warn caso alguma das variáveis esteja indefinida ou vazia
if (!import.meta.env.VITE_SUPABASE_URL || !supabaseUrl || supabaseUrl === 'undefined') {
  console.warn('⚠️ [Supabase] VITE_SUPABASE_URL está undefined ou vazia antes do createClient(supabaseUrl, supabaseAnonKey). Verifique o arquivo .env ou as variáveis de ambiente na Vercel.');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY || !supabaseAnonKey || supabaseAnonKey === 'undefined') {
  console.warn('⚠️ [Supabase] VITE_SUPABASE_ANON_KEY está undefined ou vazia antes do createClient(supabaseUrl, supabaseAnonKey). Verifique o arquivo .env ou as variáveis de ambiente na Vercel.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
