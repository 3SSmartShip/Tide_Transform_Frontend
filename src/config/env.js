const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  IS_DEV: import.meta.env.DEV,
}

// Validate required environment variables
const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
requiredVars.forEach(varName => {
  if (!env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  }
});

export default env; 