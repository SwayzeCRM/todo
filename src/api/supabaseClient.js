/**
 * Supabase Client Configuration
 * Centralized database connection management
 */

const SUPABASE_URL = 'https://eqjhpcuzcnvbvwkuhfah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxamhwY3V6Y252YnZ3a3VoZmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzQ2NDUsImV4cCI6MjA1MDIxMDY0NX0.qOSr96GM0-wXXzQj0tN7GnuwQZesH2_jPMvSTRgD44o';

// Initialize Supabase client
export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for convenience
export default supabaseClient;