import axios from 'axios'
import { supabase } from '../config/supabaseClient'
import env from '../config/env'
import { logError } from '../utils/environment'

const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const api = axios.create({
  baseURL: env.TIDE_TRANSFORM_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    logError(error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const token = await getAccessToken()
      if (token) {
        error.config.headers.Authorization = `Bearer ${token}`
        return axios(error.config)
      }
    }
    logError(error)
    return Promise.reject(error)
  }
)

export default api