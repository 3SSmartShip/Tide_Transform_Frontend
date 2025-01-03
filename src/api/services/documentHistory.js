import api from '../axios'

export const documentHistoryService = {
    getDocumentHistory: async ({ type = '3S_AI', page = 1, limit = 10 }) => {
        try {
            console.log('Document History Request Parameters:', {
                type,
                page,
                limit
            });

            const response = await api.get('/api/v1/usage/history', {
                params: {
                    type,
                    page,
                    limit
                }
            });

            console.log('Raw Document History Response:', response.data);

            // Transform the response data - updated to match actual API response structure
            const documents = response.data.transforms.map(doc => ({
                fileName: doc.filename || 'Untitled',
                pages: parseInt(doc.pages) || 0,
                status: doc.status || 'pending',
                dateAdded: new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }),
                type: doc.type || '3S_AI',
                response: doc.response?.data || {}
            }));

            console.log('Processed Documents:', documents);
            return documents;

        } catch (error) {
            console.error('Detailed error in getDocumentHistory:', {
                message: error.message,
                stack: error.stack,
                type: error.name
            });
            throw error;
        }
    }
}; 