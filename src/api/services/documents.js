import axios from 'axios'
import { supabase } from '../../config/supabaseClient'

const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const api = axios.create({
  baseURL: import.meta.env.VITE_TIDE_TRANSFORM_BASE_URL,
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
    let timeInterval = 2000;
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

        timeInterval = timeInterval * 2;
        attempts++;
        await new Promise(resolve => setTimeout(resolve, timeInterval));
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
      // Format error with status code
      throw new Error(JSON.stringify({
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'An error occurred'
      }));
    }
  },

  async uploadManual(formData, onStatusUpdate) {
    try {
      // Get and validate page numbers
      const pageNumbers = formData.get('pageNumbers');
      if (!pageNumbers) {
        throw new Error('Page numbers are required');
      }

      let parsedPageNumbers;
      try {
        parsedPageNumbers = JSON.parse(pageNumbers);
        if (!Array.isArray(parsedPageNumbers) || parsedPageNumbers.length === 0) {
          throw new Error('Invalid page numbers format');
        }
      } catch (e) {
        throw new Error('Invalid page numbers format');
      }

      // Create a new FormData with the correct format
      const newFormData = new FormData();
      newFormData.append('file', formData.get('file'));
      newFormData.append('pageNumbers', JSON.stringify(parsedPageNumbers));

      onStatusUpdate?.({ operation: 'Uploading manual...', percentage: '0%' });

      const uploadResponse = await api.post('/api/v1/transform/manual', newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (!uploadResponse.data?.jobId) {
        throw new Error('No job ID received');
      }

      onStatusUpdate?.({ operation: 'Processing started...', percentage: '0%' });
      return await this.pollStatus(uploadResponse.data.jobId, onStatusUpdate);
    } catch (error) {
      // Format error with status code
      throw new Error(JSON.stringify({
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'An error occurred'
      }));
    }
  }
};

export default documentsApi;