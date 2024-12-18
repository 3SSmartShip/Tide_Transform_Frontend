import { useState } from "react";
import { documentsApi } from "../../api/services/documents";
import { UploadIcon, X, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../Layout/Layout";
import ReactJson from "@microlink/react-json-view";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [selectedMode, setSelectedMode] = useState("ai");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select a file to transform");
      return;
    }

    const formData = new FormData();
    formData.append("file", files[0]);

    setLoading(true);

    try {
      if (selectedMode === "ai") {
        const response = await documentsApi.transformDocument(formData);
        setParsedData(response);
        setFiles([]);
      }
    } catch (err) {
      setError(err.message || "Error processing file");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="px-32px py-32px">
        {/* Removed margin for top and bottom */}
        <div className="text-left">
          <h1 className="text-2xl font-semibold text-white mb-4">
            Upload Your First Document
          </h1>
          <p className="text-gray-400 mb-6">
            Upload your document in the zone below, or drag and drop and after
            you will receive a well-structured JSON file.
          </p>

          <div className="flex justify-center mb-6">
            <div className="bg-[#1C2632] rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedMode("ai")}
                className={`px-6 py-2 rounded-md transition-all ${
                  selectedMode === "ai"
                    ? "bg-[#EEFF00] text-black font-medium"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Invoice/RFQ
              </button>
              <button
                onClick={() => setSelectedMode("pattern")}
                className={`px-6 py-2 rounded-md transition-all ${
                  selectedMode === "pattern"
                    ? "bg-[#EEFF00] text-black font-medium"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Manuals
              </button>
            </div>
          </div>

          {selectedMode === "ai" ? (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  files.length > 0 ? "border-[#EEFF00]" : "border-gray-700"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <div className="bg-[#EEFF00] rounded-lg p-4 w-16 h-16 mx-auto mb-4">
                    <UploadIcon className="h-8 w-8 text-black" />
                  </div>
                  <p className="text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supported formats: PDF
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-800 p-3 rounded-md"
                    >
                      <span className="text-gray-300">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={files.length === 0 || loading}
                className="mt-6 w-full bg-[#EEFF00] text-black py-3 px-4 rounded-md font-medium"
              >
                {loading ? "Loading..." : "Transform Document"}
              </motion.button>

              {loading && (
                <div className="flex justify-center mt-4">
                  <div className="loader"></div>
                </div>
              )}

              {parsedData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-gray-900 rounded-lg p-6"
                >
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Transform Document
                  </h2>
                  <ReactJson src={parsedData} theme="monokai" collapsed={1} />
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <Clock className="w-16 h-16 text-[#EEFF00] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-400 text-lg">
                Manuals Parsing will be available shortly.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
