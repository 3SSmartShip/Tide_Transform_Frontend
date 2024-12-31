import axios from 'axios'
import { supabase } from '../../config/supabaseClient'

const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const api = axios.create({
  baseURL: import.meta.env.VITE_TIDE_TRANSFORM_BASE_URL,
  timeout: 120000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data'
  }
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required');
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const documentsApi = {
  // Internal method to poll status
  async pollStatus(jobId, onStatusUpdate) {
    let status = 'pending';
    const maxAttempts = 30;
    let attempts = 0;

    while (status === 'pending' && attempts < maxAttempts) {
      try {
        const response = await api.get(`/api/v1/transform/status/${jobId}`);
        status = response.data.status;

        if (status === 'completed') {
          return response.data.data;
        } else if (status === 'failed') {
          throw new Error(response.data.message || 'Processing failed');
        }


        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        throw error;
      }
    }

    throw new Error('Processing timeout');
  },

  async transformDocument(formData, onStatusUpdate) {
    try {
      onStatusUpdate?.('Uploading document...');
      const uploadResponse = await api.post('/api/v1/transform/invoice', formData);

      if (!uploadResponse.data?.jobId) {
        throw new Error('No job ID received');
      }

      onStatusUpdate?.('Processing started...');
      return await this.pollStatus(uploadResponse.data.jobId, onStatusUpdate);
    } catch (error) {
      throw error;
    }
  },

  async uploadManual(formData, onStatusUpdate) {
    try {
      // Step 1: Upload and get job ID
      onStatusUpdate?.('Uploading manual...');
      const uploadResponse = await api.post('/api/v1/transform/manual', formData);
      console.log('Upload manual response:', uploadResponse.data);

      if (!uploadResponse.data?.jobId) {
        throw new Error('No job ID received');
      }

      // Step 2: Poll for results
      onStatusUpdate?.('Processing started...');
      const result = await this.pollStatus(uploadResponse.data.jobId, onStatusUpdate);
      console.log('Final manual result:', result);
      return result;
    } catch (error) {
      console.error('Manual processing error:', error);
      throw error;
    }
  }
};

export default documentsApi;