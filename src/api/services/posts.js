import api from '../axios'

export const postsApi = {
  // Get all posts
  getAllPosts: async () => {
    return await api.get('/posts')
  },

  // Get single post
  getPost: async (id) => {
    return await api.get(`/posts/${id}`)
  },

  // Create new post
  createPost: async (data) => {
    return await api.post('/posts', data)
  },

  // Update post
  updatePost: async (id, data) => {
    return await api.put(`/posts/${id}`, data)
  },

  // Delete post
  deletePost: async (id) => {
    return await api.delete(`/posts/${id}`)
  }
} 