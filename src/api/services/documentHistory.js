import api from '../axios'

export const documentHistoryService = {
    getDocumentHistory: async ({ type = '3S_AI', page = 1, limit = 10 }) => {
        try {
            console.log('Document History Request Parameters:', {
                type,
                page,
                limit
            });

            // Fetch all documents initially
            const response = await api.get('/api/v1/usage/history', {
                params: {
                    type,
                    page: 1,
                    limit: 1000 // Fetch more documents to handle client-side pagination
                }
            });

            console.log('Raw Document History Response:', response.data);

            // Transform all the documents
            const allDocuments = response.data.transforms.map(doc => ({
                fileName: doc.filename || 'Untitled',
                pages: doc.pages || '0',
                status: doc.status || 'pending',
                dateAdded: new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }),
                type: doc.type || '3S_AI',
                transforms: [{
                    pages: doc.pages,
                    response: doc.response,
                    status: doc.status,
                    fileUrl: doc.fileUrl,
                    filename: doc.filename
                }]
            }));

            // Calculate pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedDocuments = allDocuments.slice(startIndex, endIndex);

            // Return pagination metadata along with documents
            return {
                documents: paginatedDocuments,
                totalDocuments: allDocuments.length,
                currentPage: page,
                totalPages: Math.ceil(allDocuments.length / limit),
                limit
            };

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