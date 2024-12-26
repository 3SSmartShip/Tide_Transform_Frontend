import { useState, useEffect, useCallback } from "react";
import { Copy, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import CreateApiModal from "../CreateApiModel/CreateApiModel";
import { apiKeysService } from "../../api/services/apiKeys";
import Layout from "../Layout/Layout";
import React from "react";

export default function ApiDashboard() {
  const [apis, setApis] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [visibilityTimers, setVisibilityTimers] = useState({});
  const [copiedStates, setCopiedStates] = useState({});

  const fetchApiKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiKeysService.getAllApiKeys();
      console.log("Fetched API Keys:", data); // Debugging line
      setApis(
        data.map((api) => ({
          id: api.id,
          key: api.value,
          name: api.name || "Unnamed API",
          created_at: api.createdAt,
          expires_at: api.expiresAt,
          visible: false,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleApiKeyCreated = (newApiKey) => {
    console.log("API Key Created:", newApiKey); // Debugging line
    setApis((currentApis) => [
      {
        id: newApiKey.id,
        key: newApiKey.value, // Use newApiKey.value to set the key
        name: newApiKey.name || "Unnamed API", // Assuming you have a name field
        created_at: newApiKey.createdAt, // Ensure this matches your API response
        expires_at: newApiKey.expiresAt, // Map expiresAt if needed
        visible: false,
      },
      ...currentApis,
    ]);
    setIsCreateModalOpen(false);
  };

  const toggleVisibility = (id) => {
    setApis((currentApis) =>
      currentApis.map((api) => {
        if (api.id === id) {
          const isCurrentlyVisible = !api.visible;
          if (isCurrentlyVisible) {
            const timer = setTimeout(() => {
              setApis((apis) =>
                apis.map((a) => (a.id === id ? { ...a, visible: false } : a))
              );
              setCopiedStates((prev) => ({ ...prev, [id]: false }));
            }, 10000);
            setVisibilityTimers((prev) => ({ ...prev, [id]: timer }));
          } else {
            clearTimeout(visibilityTimers[id]);
            setVisibilityTimers((prev) => {
              const newTimers = { ...prev };
              delete newTimers[id];
              return newTimers;
            });
          }
          return { ...api, visible: isCurrentlyVisible };
        }
        return api;
      })
    );
  };

  const copyToClipboard = async (id, key) => {
    try {
      const apiKeyString = String(key);
      await navigator.clipboard.writeText(apiKeyString);

      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setApis((currentApis) =>
        currentApis.map((api) =>
          api.id === id ? { ...api, visible: true } : api
        )
      );

      const timer = setTimeout(() => {
        setApis((apis) =>
          apis.map((a) => (a.id === id ? { ...a, visible: false } : a))
        );
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
        setVisibilityTimers((prev) => {
          const newTimers = { ...prev };
          delete newTimers[id];
          return newTimers;
        });
      }, 10000);

      setVisibilityTimers((prev) => ({ ...prev, [id]: timer }));
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const deleteApi = async (id) => {
    try {
      await apiKeysService.deleteApiKey(id);
      setApis((currentApis) => currentApis.filter((api) => api.id !== id));
    } catch (error) {
      console.error("Failed to delete API key:", error);
    }
  };

  return (
    <Layout>
      <div className="px-32px py-32px">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">API Keys</h1>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Create API Key
            </motion.button>
            <a href="/docs" target="_blank" rel="noopener noreferrer">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Docs
              </motion.button>
            </a>
          </div>
        </div>

        <motion.div className="bg-zinc-900 rounded-lg">
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-full text-center">
                <span className="text-white">Loading APIs...</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left pb-3 text-zinc-400 font-medium">
                      API Name
                    </th>
                    <th className="text-left pb-3 text-zinc-400 font-medium">
                      API Key
                    </th>
                    <th className="text-left pb-3 text-zinc-400 font-medium">
                      Created
                    </th>
                    <th className="text-left pb-3 text-zinc-400 font-medium">
                      Expires
                    </th>
                    <th className="text-left pb-3 text-zinc-400 font-medium">
                      Status
                    </th>
                    <th className="text-left pb-3 text-zinc-400 font-medium w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {apis.map((api) => (
                    <motion.tr
                      key={api.id}
                      className="border-b border-zinc-800"
                    >
                      <td className="py-4 font-medium text-white">
                        {api.name}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-zinc-400">
                            {api.visible ? api.key : "•".repeat(20)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(api.id, api.key)}
                            className="p-1 hover:bg-zinc-800 rounded"
                          >
                            <Copy className="h-4 w-4 text-zinc-500 hover:text-zinc-400" />
                          </button>
                          {copiedStates[api.id] && (
                            <span className="text-green-400 ml-2">Copied!</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-zinc-400">
                        {new Date(api.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-zinc-400">
                        {new Date(api.expires_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            new Date() >= new Date(api.created_at) &&
                            new Date() <= new Date(api.expires_at)
                              ? "border-green-200 text-green-200"
                              : "border-[#FBB025] text-[#FBB025]"
                          }`}
                        >
                          {new Date() >= new Date(api.created_at) &&
                          new Date() <= new Date(api.expires_at)
                            ? "Active"
                            : "Not Active"}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => deleteApi(api.id)}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {isCreateModalOpen && (
          <CreateApiModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onApiKeyCreated={handleApiKeyCreated}
          />
        )}
      </div>
    </Layout>
  );
}
