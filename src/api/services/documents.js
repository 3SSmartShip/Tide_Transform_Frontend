import axios from 'axios'
import { supabase } from '../../config/supabaseClient'

const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const transformApi = axios.create({
  baseURL: import.meta.env.VITE_TIDE_TRANSFORM_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data'
  }
})

transformApi.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    config.headers.Authorization = `Bearer ${token}`
    return config
  }
)

export const documentsApi = {
  transformDocument: async (formData) => {
    try {
      const response = await transformApi.post('/api/v1/transform/invoice', formData)
      return response.data
    } catch (error) {
      console.error('Transform API Error:', error)
      throw error
    }
  },
  uploadManual: async (formData) => {
    try {
      const response = await transformApi.post('/api/v1/transform/manual', formData)
      return response.data
    } catch (error) {
      console.error('Manual Transform API Error:', error)
      throw error
    }
  }
}
export default documentsApi