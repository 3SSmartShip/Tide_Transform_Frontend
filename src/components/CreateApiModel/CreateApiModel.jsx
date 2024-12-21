import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiKeysService } from '../../api/services/apiKeys';

export default function CreateApiModal({ isOpen, onClose, onApiKeyCreated }) {
  const [apiName, setApiName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!apiName) return;
  
    setIsLoading(true);
    setError('');
  
    try {
      const newApiKey = await apiKeysService.createApiKey(apiName);
      console.log("New API Key Created:", newApiKey.key); // Print the actual API key
      if (typeof onApiKeyCreated === 'function') {
        onApiKeyCreated(newApiKey); // Pass the new API key to the parent component
      }
      setApiName('');
      onClose();
    } catch (err) {
      setError('Failed to generate API key');
      console.error('API key generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-[#2A2F3C] rounded-lg p-8 mx-4 relative"
            onClick={e => e.stopPropagation()}
          >

                    <h2 className="text-2xl font-semibold text-white mb-2 text-center">Create API Key</h2>
                    <p className="text-gray-400 text-center">Generate your Api key to seamlessly integrate intelligent document parsing into your maritime operations.</p>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  API Name
                </label>
                <input
                  type="text"
                  value={apiName}
                  onChange={(e) => setApiName(e.target.value)}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-md py-2 px-3 text-white"
                  placeholder="Enter API name"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={isLoading || !apiName}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700"
              >
                {isLoading ? 'Generating...' : 'Generate Key'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

