import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hpcwsrrahkzidbuzwgmj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwY3dzcnJhaGt6aWRidXp3Z21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMTU5MjAsImV4cCI6MjEwNTU5MTkyMH0.-SUDqNzS4P9_W7vb7wxg_IZXge5hK7SbxmY5QWTVQd4';

if (!import.meta.env.VITE_SUPABASE_URL || !SUPABASE_URL || SUPABASE_URL === 'undefined') {
  console.warn('⚠️ [Supabase] VITE_SUPABASE_URL está undefined ou vazia antes do createClient. Utilizando credencial padrão.');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'undefined') {
  console.warn('⚠️ [Supabase] VITE_SUPABASE_ANON_KEY está undefined ou vazia antes do createClient. Utilizando credencial padrão.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

