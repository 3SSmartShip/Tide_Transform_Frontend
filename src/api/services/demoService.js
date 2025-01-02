import axios from 'axios';

const demoApi = axios.create({
    baseURL: import.meta.env.VITE_TIDE_TRANSFORM_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'x-api-key': import.meta.env.VITE_API_KEY,
    },
});

export const demoService = {
    // Transform document (invoice or manual)
    transformDocument: async (formData, type = 'invoice') => {
        try {
            const endpoint = type === 'invoice' ? '/api/v1/demo/invoice' : '/api/v1/demo/manual';
            const response = await demoApi.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-api-key': import.meta.env.VITE_API_KEY,
                }
            });
            return response.data; // This should contain the jobId
        } catch (error) {
            // Specific handling for rate limiting
            throw error.response?.data || error;
        }
    },

    // Get status and results
    getDemoStatus: async (jobId) => {
        try {
            const response = await demoApi.get(`/api/v1/demo/status/${jobId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_API_KEY,
                }
            });
            return response.data;
        } catch (error) {
            // Specific handling for rate limiting
            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'];
                const waitTime = retryAfter ? `Please try again after ${retryAfter} seconds.` : 'Please try again later.';
                throw new Error(`Rate limit exceeded. ${waitTime}`);
            }
            // Handle other errors
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred while checking status';
            throw new Error(errorMessage);
        }
    }
};

export default demoService;
