"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documentsApi } from "../../api/services/documents";
import { UploadIcon, X, Clock, FileX } from 'lucide-react';
import { motion } from "framer-motion";
import Layout from "../Layout/Layout";
import ReactJson from "@microlink/react-json-view";
import { supabase } from "../../config/supabaseClient";

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

  const UploadView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-white">
            Upload Your Document
          </h1>
          <p className="text-gray-400 mt-1">
            Go from Documents to Structured Data within seconds! Powered by 3S AI
          </p>
        </div>
        <div className="bg-[#1C2632] rounded-lg p-1 flex">
          <button
            onClick={() => setSelectedMode("ai")}
            className={`px-6 py-2 rounded-md transition-all ${
              selectedMode === "ai"
                ? "bg-[#2563EB] text-white font-medium"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Invoice/RFQ
          </button>
          <button
            onClick={() => setSelectedMode("pattern")}
            className={`px-6 py-2 rounded-md transition-all ${
              selectedMode === "pattern"
                ? "bg-[#2563EB] text-white font-medium"
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
              <p className="text-gray-400">Click to upload or drag and drop</p>
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
            className="mt-6 w-full bg-[#2563EB] text-white py-3 px-4 rounded-md font-medium disabled:opacity-50"
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
          <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-gray-400 text-lg">
            Manuals Parsing will be available shortly.
          </p>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <Layout>
      <div className="px-32px py-32px ">
        <UploadView />
      </div>
    </Layout>
  );
}

