import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hpcwsrrahkzidbuzwgmj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwY3dzcnJhaGt6aWRidXp3Z21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMTU5MjAsImV4cCI6MjEwNTU5MTkyMH0.-SUDqNzS4P9_W7vb7wxg_IZXge5hK7SbxmY5QWTVQd4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
