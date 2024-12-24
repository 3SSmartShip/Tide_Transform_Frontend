// Start of Selection
import { useState } from "react";
import { documentsApi } from "../../api/services/documents";
import { UploadIcon, X, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../Layout/Layout";
import ReactJson from "@microlink/react-json-view";

export default function Upload() {
  const [invoiceFiles, setInvoiceFiles] = useState([]);
  const [manualFiles, setManualFiles] = useState([]);
  const [invoiceError, setInvoiceError] = useState(null);
  const [manualError, setManualError] = useState(null);
  const [invoiceParsedData, setInvoiceParsedData] = useState(null);
  const [manualParsedData, setManualParsedData] = useState(null);
  const [selectedMode, setSelectedMode] = useState("invoice");
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [invoiceSuccessMessage, setInvoiceSuccessMessage] = useState("");
  const [manualSuccessMessage, setManualSuccessMessage] = useState("");

  const handleInvoiceUpload = async () => {
    if (invoiceFiles.length === 0) {
      setInvoiceError("Please select a file to transform");
      return;
    }

    const formData = new FormData();
    formData.append("file", invoiceFiles[0]);

    setInvoiceLoading(true);

    try {
      const response = await documentsApi.transformDocument(formData);
      setInvoiceParsedData(response);
      setInvoiceFiles([]);
      setInvoiceSuccessMessage("Invoice transformed successfully!");
    } catch (err) {
      setInvoiceError(err.message || "Error processing invoice");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleManualUpload = async () => {
    if (manualFiles.length === 0) {
      setManualError("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", manualFiles[0]);

    setManualLoading(true);

    try {
      const response = await documentsApi.uploadManual(formData);
      setManualParsedData(response);
      setManualFiles([]);
      setManualSuccessMessage("Manual uploaded and processed successfully!");
    } catch (err) {
      setManualError(err.message || "Error uploading manual");
    } finally {
      setManualLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      if (selectedMode === "invoice") {
        setInvoiceFiles(selectedFiles);
        setInvoiceError(null);
        setInvoiceSuccessMessage("");
        setInvoiceParsedData(null);
      } else {
        setManualFiles(selectedFiles);
        setManualError(null);
        setManualSuccessMessage("");
        setManualParsedData(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      if (selectedMode === "invoice") {
        setInvoiceFiles(droppedFiles);
        setInvoiceError(null);
        setInvoiceSuccessMessage("");
        setInvoiceParsedData(null);
      } else {
        setManualFiles(droppedFiles);
        setManualError(null);
        setManualSuccessMessage("");
        setManualParsedData(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    if (selectedMode === "invoice") {
      setInvoiceFiles(invoiceFiles.filter((_, i) => i !== index));
    } else {
      setManualFiles(manualFiles.filter((_, i) => i !== index));
    }
  };

  const handleCopy = () => {
    const dataToCopy =
      selectedMode === "invoice" ? invoiceParsedData : manualParsedData;
    if (dataToCopy) {
      navigator.clipboard
        .writeText(JSON.stringify(dataToCopy, null, 2))
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy JSON:", err);
        });
    }
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
            Go from Documents to Structured Data within seconds! Powered by 3S
            AI
          </p>
        </div>
        <div className="bg-[#1C2632] rounded-lg p-1 flex">
          <button
            onClick={() => {
              setSelectedMode("invoice");
              setManualParsedData(null);
              setManualSuccessMessage("");
              setManualError(null);
            }}
            className={`px-6 py-2 rounded-md transition-all ${
              selectedMode === "invoice"
                ? "bg-[#2563EB] text-white font-medium"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Invoice/RFQ
          </button>
          <button
            onClick={() => {
              setSelectedMode("manual");
              setInvoiceParsedData(null);
              setInvoiceSuccessMessage("");
              setInvoiceError(null);
            }}
            className={`px-6 py-2 rounded-md transition-all ${
              selectedMode === "manual"
                ? "bg-[#2563EB] text-white font-medium"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Manuals
          </button>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          (selectedMode === "invoice" ? invoiceFiles : manualFiles).length > 0
            ? "border-green-500"
            : "border-gray-700"
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
          <div className="bg-green-500 rounded-lg p-4 w-16 h-16 mx-auto mb-4">
            <UploadIcon className="h-8 w-8 text-black" />
          </div>
          <p className="text-gray-400">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PDF, DOC, DOCX, TXT
          </p>
        </label>
      </div>

      {selectedMode === "invoice" && invoiceFiles.length > 0 && (
        <div className="mt-4">
          {invoiceFiles.map((file, index) => (
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

      {selectedMode === "manual" && manualFiles.length > 0 && (
        <div className="mt-4">
          {manualFiles.map((file, index) => (
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

      <AnimatePresence>
        {selectedMode === "invoice" && invoiceError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md"
          >
            <p className="text-red-400">{invoiceError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMode === "manual" && manualError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md"
          >
            <p className="text-red-400">{manualError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMode === "invoice" && invoiceSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-md"
          >
            <p className="text-green-400">{invoiceSuccessMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMode === "manual" && manualSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-md"
          >
            <p className="text-green-400">{manualSuccessMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={
          selectedMode === "invoice" ? handleInvoiceUpload : handleManualUpload
        }
        disabled={
          (selectedMode === "invoice" ? invoiceFiles : manualFiles).length ===
            0 || (selectedMode === "invoice" ? invoiceLoading : manualLoading)
        }
        className="mt-6 w-full bg-[#2563EB] text-white py-3 px-4 rounded-md font-medium disabled:opacity-50"
      >
        {selectedMode === "invoice"
          ? invoiceLoading
            ? "Transforming..."
            : "Transform Document"
          : manualLoading
          ? "Processing..."
          : "Process Manual"}
      </motion.button>

      {(selectedMode === "invoice" ? invoiceLoading : manualLoading) && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}

      {((selectedMode === "invoice" && invoiceParsedData) ||
        (selectedMode === "manual" && manualParsedData)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gray-900 rounded-lg p-6 relative"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              {selectedMode === "invoice"
                ? "Transformed Document"
                : "Processed Manual"}
            </h2>
            <div className="relative">
              {copySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full mb-2 bg-black text-white px-4 py-2 rounded-md"
                >
                  Copied!
                </motion.div>
              )}
              <button
                onClick={handleCopy}
                className="text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>
          <ReactJson
            src={
              selectedMode === "invoice" ? invoiceParsedData : manualParsedData
            }
            theme="monokai"
            collapsed={false}
          />
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <Layout>
      <div className="px-32px py-32px">
        <UploadView />
      </div>
    </Layout>
  );
}
