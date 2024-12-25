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

// Enhanced styles with better structure
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#2563EB",
    padding: 10,
    borderBottom: 1,
    borderColor: "#2563EB",
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    padding: 8,
    color: "#1f2937",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 4,
    minHeight: 25,
    alignItems: "flex-start",
  },
  key: {
    width: "30%",
    textAlign: "left",
    fontWeight: "bold",
    paddingRight: 10,
    color: "#4b5563",
    paddingTop: 2,
  },
  value: {
    width: "70%",
    textAlign: "left",
    flexWrap: "wrap",
  },
  subsection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  nestedContainer: {
    marginLeft: 20,
    marginTop: 4,
  },
  nestedRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 2,
    alignItems: "flex-start",
  },
  nestedKey: {
    width: "30%",
    textAlign: "left",
    fontWeight: "bold",
    paddingRight: 10,
    color: "#6b7280",
    paddingTop: 2,
  },
  nestedValue: {
    width: "70%",
    textAlign: "left",
    color: "#374151",
    flexWrap: "wrap",
  },
  addressValue: {
    width: "70%",
    textAlign: "left",
    color: "#374151",
    flexWrap: "wrap",
    lineHeight: 1.4,
  },
});

// Improved function to format nested values
const formatNestedValue = (key, value) => {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${formatNestedValue(k, v)}`)
      .join(", ");
  }
  // Special handling for address fields
  if (key.toLowerCase().includes("address")) {
    return String(value);
  }
  return String(value);
};

// Enhanced function to handle any type of manual data
const renderSection = (title, data) => {
  // Handle case where data is undefined or not an array
  if (!data || !Array.isArray(data)) return null;

  return (
    <View>
      <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.subsection}>
          {Object.entries(item).map(([key, value]) => (
            <View key={key}>
              {typeof value !== "object" ? (
                <View style={styles.row}>
                  <Text style={styles.key}>
                    {key.replace(/_/g, " ").toUpperCase()}
                  </Text>
                  <Text
                    style={
                      key.toLowerCase().includes("address")
                        ? styles.addressValue
                        : styles.value
                    }
                  >
                    {value}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.row}>
                    <Text style={styles.key}>
                      {key.replace(/_/g, " ").toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.nestedContainer}>
                    {Object.entries(value).map(([nestedKey, nestedValue]) => (
                      <View key={nestedKey} style={styles.nestedRow}>
                        <Text style={styles.nestedKey}>
                          {nestedKey.replace(/_/g, " ").toUpperCase()}
                        </Text>
                        <Text
                          style={
                            nestedKey.toLowerCase().includes("address")
                              ? styles.addressValue
                              : styles.nestedValue
                          }
                        >
                          {formatNestedValue(nestedKey, nestedValue)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Enhanced BeautifiedPDF to handle different document types
const BeautifiedPDF = ({ jsonData }) => {
  const { data } = jsonData;

  // Helper function to get document type
  const getDocumentType = (type) => {
    return type ? type.replace(/_/g, " ").toUpperCase() : "DOCUMENT DETAILS";
  };

  // Helper function to determine which sections to render
  const getSections = (data) => {
    if (data.type === "invoice") {
      return [
        { title: "Invoice Details", data: [data] },
        { title: "Items", data: data.items },
        { title: "Payment Instructions", data: [data.payment_instructions] },
      ];
    } else {
      return Object.entries(data)
        .filter(
          ([key, value]) =>
            Array.isArray(value) &&
            key !== "type" &&
            key !== "parseTime" &&
            key !== "formatTime"
        )
        .map(([key, value]) => ({
          title: key.replace(/_/g, " "),
          data: value,
        }));
    }
  };

  const sections = getSections(data);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{getDocumentType(data.type)}</Text>

        {data.type && (
          <View style={styles.row}>
            <Text style={styles.key}>TYPE</Text>
            <Text style={styles.value}>{data.type}</Text>
          </View>
        )}

        {sections.map((section, index) => (
          <View key={index}>{renderSection(section.title, section.data)}</View>
        ))}
      </Page>
    </Document>
  );
};

// Define styles for Invoice/RFQ
const invoiceStyles = StyleSheet.create({
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

// Component to render invoice items section
const renderInvoiceItems = (items) => (
  <View>
    <Text style={invoiceStyles.sectionHeader}>Items</Text>
    {items.map((item, index) => (
      <View key={index} style={invoiceStyles.subsection}>
        {Object.keys(item).map((key) => (
          <View key={key} style={invoiceStyles.row}>
            <Text style={invoiceStyles.key}>{key.replace(/_/g, " ")}:</Text>
            <Text style={invoiceStyles.value}>{item[key]}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);

// Invoice PDF Component
const InvoicePDF = ({ jsonData }) => {
  const { data } = jsonData?.data || jsonData;

  return (
    <Document>
      <Page size="A4" style={invoiceStyles.page}>
        <Text style={invoiceStyles.sectionHeader}>Invoice Details</Text>
        <View style={invoiceStyles.row}>
          <Text style={invoiceStyles.key}>Type:</Text>
          <Text style={invoiceStyles.value}>{data.type}</Text>
        </View>
        <View style={invoiceStyles.row}>
          <Text style={invoiceStyles.key}>Customer:</Text>
          <Text style={invoiceStyles.value}>{data.customer}</Text>
        </View>
        <View style={invoiceStyles.row}>
          <Text style={invoiceStyles.key}>Date:</Text>
          <Text style={invoiceStyles.value}>{data.date}</Text>
        </View>
        <View style={invoiceStyles.row}>
          <Text style={invoiceStyles.key}>Invoice No:</Text>
          <Text style={invoiceStyles.value}>{data.invoice_no}</Text>
        </View>
        <View style={invoiceStyles.row}>
          <Text style={invoiceStyles.key}>Order No:</Text>
          <Text style={invoiceStyles.value}>{data.order_no}</Text>
        </View>

        {renderInvoiceItems(data.items)}

        <View style={invoiceStyles.row}>
          <Text style={invoiceStyles.key}>Discount:</Text>
          <Text style={invoiceStyles.value}>{data.discount}</Text>
        </View>
        <View style={invoiceStyles.row}>
          <Text style={invoiceStyles.key}>Total Amount:</Text>
          <Text
            style={invoiceStyles.value}
          >{`${data.currency} ${data.total_amount}`}</Text>
        </View>

        <Text style={invoiceStyles.sectionHeader}>Payment Instructions</Text>
        {Object.entries(data.payment_instructions)
          .filter(([_, value]) => value) // Only show non-empty values
          .map(([key, value]) => (
            <View key={key} style={invoiceStyles.row}>
              <Text style={invoiceStyles.key}>
                {key.replace(/_/g, " ").toUpperCase()}:
              </Text>
              <Text style={invoiceStyles.value}>{value}</Text>
            </View>
          ))}
      </Page>
    </Document>
  );
};

// PDFPreview component
const PDFPreview = ({ data }) => {
  const isInvoice = data?.data?.data?.type?.toLowerCase().includes("invoice");
  const fileName = isInvoice
    ? `invoice_${data?.data?.data?.invoice_no || "document"}.pdf`
    : `manual_${data?.data?.data?.file_name || "document"}.pdf`;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-white mb-2">PDF Preview</h3>
      <div className="p-4 rounded">
        <PDFDownloadLink
          document={
            isInvoice ? (
              <InvoicePDF jsonData={data} />
            ) : (
              <BeautifiedPDF jsonData={data} />
            )
          }
          fileName={fileName}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {({ loading }) =>
            loading ? "Generating PDF..." : "Download Document"
          }
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
