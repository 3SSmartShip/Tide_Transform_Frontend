import api from '../axios'

export const apiKeysService = {
  getAllApiKeys: async () => {
    const response = await api.get('/api/v1/keys')
    return response.data
  },

  createApiKey: async (name) => {
    const response = await api.post('/api/v1/keys', { name })
    return response.data
  },
  deleteApiKey: async (id) => {
    const response = await api.delete(`/api/v1/keys/${id}`)
    return response.data
  }
}