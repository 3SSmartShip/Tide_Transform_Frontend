import axios from 'axios';

const demoApi = axios.create({
    baseURL: import.meta.env.VITE_TIDE_TRANSFORM_BASE_URL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
    },
});

export const demoService = {
    transformDocument: async (formData) => {
        try {
            const response = await demoApi.post('/api/v1/demo/invoice', formData);
            return response.data;
        } catch (error) {
            console.error('Demo API Error:', error);
            throw error;
        }
    },
    uploadManual: async (formData) => {
        try {
            const response = await demoApi.post('/api/v1/demo/manual', formData);
            return response.data;
        } catch (error) {
            console.error('Manual Upload API Error:', error);
            throw error;
        }
    },
};

export default demoService; 