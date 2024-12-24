import { useState } from "react";
import { documentsApi } from "../../api/services/documents";
import { UploadIcon, X, Copy, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../Layout/Layout";
import ReactJson from "@microlink/react-json-view";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { jsonToPlainText } from "json-to-plain-text";

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    textDecoration: "underline",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  key: {
    flex: 1,
    textAlign: "left",
    fontWeight: "bold",
    marginRight: 5,
  },
  value: {
    flex: 2,
    textAlign: "left",
  },
  subsection: {
    marginBottom: 10,
  },
});

// Component to render a section
const renderSection = (title, data) => {
  // Check if data exists and is an array
  if (!data || !Array.isArray(data)) return null;

  return (
    <View>
      <Text style={styles.sectionHeader}>{title}</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.subsection}>
          {Object.keys(item).map((key) => (
            <View key={key} style={styles.row}>
              <Text style={styles.key}>{key.replace(/_/g, " ")}:</Text>
              <Text style={styles.value}>
                {typeof item[key] === "object"
                  ? JSON.stringify(item[key], null, 2)
                  : item[key]}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Beautified PDF Document
const BeautifiedPDF = ({ data }) => {
  // Helper function to determine document type and structure
  const getDocumentSections = (data) => {
    // Check if data has the expected structure
    if (!data || typeof data !== "object") return null;

    // Handle manual type documents
    if (data.type && data.type.toLowerCase().includes("manual")) {
      return (
        <>
          <Text style={styles.sectionHeader}>Type</Text>
          <Text style={styles.value}>{data.type}</Text>

          {renderSection(
            "Assembly and Subassembly Detection",
            data.assembly_and_subassembly_detection
          )}
          {renderSection(
            "Spare Parts Information",
            data.spare_parts_information
          )}
          {renderSection(
            "Manufacturer Contact Details",
            data.manufacturer_contact_details
          )}
        </>
      );
    }

    // Handle invoice/RFQ type documents
    else {
      return (
        <>
          {renderSection("Invoice Details", data.invoice_details)}
          {renderSection("Product Information", data.product_information)}
          {renderSection("Pricing Details", data.pricing_details)}
          {renderSection("Supplier Information", data.supplier_information)}
          {renderSection("Payment Terms", data.payment_terms)}
          {renderSection("Shipping Details", data.shipping_details)}
          {/* Add any other sections that might be present in invoice/RFQ data */}
        </>
      );
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {getDocumentSections(data)}
      </Page>
    </Document>
  );
};

// Update the PDFPreview component
const PDFPreview = ({ data }) => {
  // Get the filename based on document type
  const getFileName = () => {
    const docType = data?.data?.type?.toLowerCase() || "";
    if (docType.includes("manual")) {
      return "manual_document.pdf";
    } else if (docType.includes("invoice")) {
      return "invoice_document.pdf";
    } else if (docType.includes("rfq")) {
      return "rfq_document.pdf";
    }
    return "processed_document.pdf";
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-white mb-2">PDF Preview</h3>
      <div className="bg-white p-4 rounded">
        <PDFDownloadLink
          document={<BeautifiedPDF data={data.data} />}
          fileName={getFileName()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

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
  const [pdfUrl, setPdfUrl] = useState(null);

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
      console.log("API Response:", response);

      // Only proceed with PDF generation if we have valid data
      if (response && Object.keys(response).length > 0) {
        setInvoiceParsedData(response);
        setInvoiceFiles([]);
        setInvoiceSuccessMessage("Invoice transformed successfully!");
        generatePDF(response);
      } else {
        throw new Error("Empty response from API");
      }
    } catch (err) {
      console.error("Full error details:", err);
      setInvoiceError(
        err.response?.data?.message || err.message || "Error processing invoice"
      );
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
      console.log("API Response:", response);

      // Only proceed with PDF generation if we have valid data
      if (response && Object.keys(response).length > 0) {
        setManualParsedData(response);
        setManualFiles([]);
        setManualSuccessMessage("Manual uploaded and processed successfully!");
        generatePDF(response);
      } else {
        throw new Error("Empty response from API");
      }
    } catch (err) {
      console.error("Full error details:", err);
      setManualError(
        err.response?.data?.message || err.message || "Error uploading manual"
      );
    } finally {
      setManualLoading(false);
    }
  };

  const generatePDF = (data) => {
    // No need to manually generate PDF here
    // PDFDownloadLink will handle it
    setPdfUrl(true); // Just set to true to indicate PDF is ready
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
      setPdfUrl(null);
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
      setPdfUrl(null);
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
    setPdfUrl(null);
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

  const getCurrentData = () => {
    return selectedMode === "invoice" ? invoiceParsedData : manualParsedData;
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
              setPdfUrl(null);
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
              setPdfUrl(null);
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

      {getCurrentData() && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gray-900 rounded-lg p-6 relative"
        >
          <PDFPreview data={getCurrentData()} />
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-white">JSON Response</h2>
            <ReactJson
              src={getCurrentData()}
              theme="monokai"
              collapsed={false}
            />
          </div>
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
