import axios from 'axios'
import env from '../config/env'

// Create axios instance with default config
const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': env.API_KEY,
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add environment-specific headers
    if (env.IS_DEV) {
      config.headers['X-Environment'] = 'development'
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Add environment-specific error handling
    if (env.IS_DEV) {
      console.error('API Error:', error)
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 