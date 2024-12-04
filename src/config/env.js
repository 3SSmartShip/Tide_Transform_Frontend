const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_KEY: import.meta.env.VITE_API_KEY,
  ENV: import.meta.env.VITE_ENV,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
}

// Validate required environment variables
const requiredEnvVars = ['API_BASE_URL', 'API_KEY']

requiredEnvVars.forEach(key => {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

export default env 