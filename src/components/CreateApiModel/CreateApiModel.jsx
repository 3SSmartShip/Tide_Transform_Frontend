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
      if (typeof onApiKeyCreated === 'function') {
        onApiKeyCreated(newApiKey);
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
            className="w-full max-w-lg bg-[#2A2F3C] rounded-lg p-8 mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-white mb-2">Create API Key</h2>
            
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