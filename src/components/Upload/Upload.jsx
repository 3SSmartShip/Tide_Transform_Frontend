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
    borderBottomWidth: 1,
    borderBottomColor: "#2563EB",
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
    marginLeft: 40,
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
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  label: {
    width: "30%",
    textAlign: "left",
    fontWeight: "bold",
    color: "#374151",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    paddingRight: 10,
  },
  itemBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 10,
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

// BeautifiedPDF component for manuals
const BeautifiedPDF = ({ jsonData }) => {
  const { data } = jsonData?.data || jsonData;

  const sections = [
    {
      title: "Assembly and Subassembly Details",
      data: data?.assembly_and_subassembly_detection?.map((item) => ({
        "Part Number": item.part_number,
        "Maker Name": item.maker_details?.name,
        "Maker Address": item.maker_details?.address,
        "Contact Phone": item.maker_details?.contact?.phone,
        "Contact Email": item.maker_details?.contact?.email,
        "Serial Number": item.serial_number,
        Model: item.model,
        Quantity: item.quantity,
      })),
    },
    {
      title: "Spare Parts Information",
      data: data?.spare_parts_information?.map((item) => ({
        "Part Number": item.part_number,
        Description: item.description,
        "Quantity in Stock": item.quantity_in_stock,
        Compatibility: item.compatibility,
        Price: item.price,
      })),
    },
    {
      title: "Manufacturer Contact Details",
      data: data?.manufacturer_contact_details?.map((item) => ({
        Name: item.manufacturer_name,
        Address: item.address,
        Phone: item.phone,
        Email: item.email,
        Website: item.website,
      })),
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{data?.type || "Manual"}</Text>

        {sections.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            {section.data?.map((item, idx) => (
              <View key={idx} style={styles.section}>
                {Object.entries(item).map(([key, value]) => (
                  <View key={key} style={styles.row}>
                    <Text style={styles.label}>{key}:</Text>
                    <Text style={styles.value}>{value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

// InvoicePDF component
const InvoicePDF = ({ jsonData }) => {
  const { data } = jsonData?.data || jsonData;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Invoice Details</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{data.customer}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{data.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice No:</Text>
            <Text style={styles.value}>{data.invoice_no}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order No:</Text>
            <Text style={styles.value}>{data.order_no}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Items</Text>
        {data.items.map((item, index) => (
          <View key={index} style={styles.itemBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{item.description}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Part No</Text>
              <Text style={styles.value}>{item.part_no}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Quantity</Text>
              <Text style={styles.value}>{item.quantity}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Unit Price</Text>
              <Text
                style={styles.value}
              >{`${item.currency} ${item.unit_price}`}</Text>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={styles.label}>Total Price</Text>
              <Text
                style={styles.value}
              >{`${item.currency} ${item.total_price}`}</Text>
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Discount:</Text>
            <Text style={styles.value}>{data.discount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text
              style={styles.value}
            >{`${data.currency} ${data.total_amount}`}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Payment Instructions</Text>
        <View style={styles.section}>
          {Object.entries(data.payment_instructions).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>
                {key.replace(/_/g, " ").toUpperCase()}:
              </Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// PDFPreview component
const PDFPreview = ({ data }) => {
  if (!data || !data.data) {
    return null;
  }

  const isInvoice = data?.data?.data?.type?.toLowerCase()?.includes("invoice");
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

// Add these animation variants at the top
const loadingVariants = {
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 360],
    borderRadius: ["20%", "50%", "20%"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const particleVariants = {
  animate: (i) => ({
    y: [0, -30, 0],
    x: [0, i % 2 === 0 ? 20 : -20, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      delay: i * 0.2,
    },
  }),
};

const successIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
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
  const [jobStatus, setJobStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleInvoiceUpload = async () => {
    if (invoiceFiles.length === 0) {
      setInvoiceError("Please select a file to transform");
      return;
    }

    const formData = new FormData();
    formData.append("file", invoiceFiles[0]);

    setInvoiceLoading(true);
    setInvoiceError(null);

    try {
      const result = await documentsApi.transformDocument(
        formData,
        (status) => {
          setJobStatus(status);
        }
      );

      if (result) {
        const formattedData = {
          data: {
            data: result,
          },
        };
        setInvoiceParsedData(formattedData);
        setInvoiceFiles([]);
        setInvoiceSuccessMessage("Invoice transformed successfully!");
        setPdfUrl(true);
      }
    } catch (error) {
      console.error("Transform error:", error);
      setInvoiceError(
        JSON.stringify(
          {
            error: {
              status: error.response?.status || 500,
              message: error.message || "Error processing invoice",
            },
          },
          null,
          2
        )
      );
      setInvoiceParsedData(null);
      setPdfUrl(null);
    } finally {
      setInvoiceLoading(false);
      setJobStatus(null);
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
    setManualError(null);

    try {
      const result = await documentsApi.uploadManual(formData, (status) => {
        setJobStatus(status);
      });

      if (result) {
        const formattedData = {
          data: {
            data: result,
          },
        };
        setManualParsedData(formattedData);
        setManualFiles([]);
        setManualSuccessMessage("Manual processed successfully!");
        setPdfUrl(true);
      }
    } catch (error) {
      console.error("Manual processing error:", error);
      setManualError(
        JSON.stringify(
          {
            error: {
              status: error.response?.status || 500,
              message: error.message || "Error processing manual",
            },
          },
          null,
          2
        )
      );
      setManualParsedData(null);
      setPdfUrl(null);
    } finally {
      setManualLoading(false);
      setJobStatus(null);
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
    if (selectedMode === "invoice") {
      if (invoiceParsedData) {
        return invoiceParsedData;
      }
      if (invoiceError) {
        try {
          return JSON.parse(invoiceError);
        } catch (e) {
          return { error: invoiceError };
        }
      }
      return null;
    } else {
      if (manualParsedData) {
        return manualParsedData;
      }
      if (manualError) {
        try {
          return JSON.parse(manualError);
        } catch (e) {
          return { error: manualError };
        }
      }
      return null;
    }
  };

  const UploadView = () => (
    <div className="w-full">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-white">
          Upload Your Document
        </h1>
        <p className="text-gray-400 mt-1 pb-4">
          Go from Documents to Structured Data within seconds! Powered by 3S AI
        </p>
      </div>

      <div className="mb-4 inline-flex bg-[#1C2632] rounded-lg p-1.5">
        <button
          onClick={() => {
            setSelectedMode("invoice");
            setManualParsedData(null);
            setManualSuccessMessage("");
            setManualError(null);
            setPdfUrl(null);
          }}
          className={`px-6 py-2 rounded-md transition-colors ${
            selectedMode === "invoice"
              ? "bg-[#2563EB] text-white font-medium"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Invoices/RFQs
        </button>
        <button
          onClick={() => {
            setSelectedMode("manual");
            setInvoiceParsedData(null);
            setInvoiceSuccessMessage("");
            setInvoiceError(null);
            setPdfUrl(null);
          }}
          className={`px-6 py-2 rounded-md transition-colors ${
            selectedMode === "manual"
              ? "bg-[#2563EB] text-white font-medium"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Manuals
        </button>
      </div>

      <div className="w-full">
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

        <AnimatePresence mode="wait">
          {selectedMode === "invoice" && invoiceFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
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
            </motion.div>
          )}

          {selectedMode === "manual" && manualFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selectedMode === "invoice" && invoiceError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md"
            >
              <pre className="text-red-400 whitespace-pre-wrap">
                {invoiceError}
              </pre>
            </motion.div>
          )}

          {selectedMode === "manual" && manualError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md"
            >
              <pre className="text-red-400 whitespace-pre-wrap">
                {manualError}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selectedMode === "invoice" && invoiceSuccessMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-md"
            >
              <p className="text-green-400">{invoiceSuccessMessage}</p>
            </motion.div>
          )}

          {selectedMode === "manual" && manualSuccessMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-md"
            >
              <p className="text-green-400">{manualSuccessMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={
              selectedMode === "invoice"
                ? handleInvoiceUpload
                : handleManualUpload
            }
            disabled={
              (selectedMode === "invoice" ? invoiceFiles : manualFiles)
                .length === 0 ||
              (selectedMode === "invoice" ? invoiceLoading : manualLoading)
            }
            className="mt-6 w-full max-w-xs bg-[#2563EB] text-white py-2 px-3 rounded-md font-medium disabled:opacity-50 text-m"
          >
            {selectedMode === "invoice"
              ? invoiceLoading
                ? "Transforming..."
                : "Transform Document"
              : manualLoading
              ? "Transforming..."
              : "Transform Manuals "}
          </motion.button>
        </div>

        {(invoiceLoading || manualLoading) && (
          <motion.div
            className="relative flex flex-col items-center mt-8 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Particle effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-blue-500 rounded-full"
                custom={i}
                variants={particleVariants}
                animate="animate"
                style={{
                  left: "50%",
                  top: "50%",
                }}
              />
            ))}

            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500"
              variants={loadingVariants}
              animate="animate"
            />

            {jobStatus && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mt-6"
              >
                <motion.p
                  className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {jobStatus}
                </motion.p>
                <p className="text-gray-500 mt-2">
                  Processing your document with AI magic ✨
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {(getCurrentData() || invoiceError || manualError) && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  damping: 20,
                  stiffness: 100,
                },
              }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 relative overflow-hidden shadow-xl"
            >
              {/* Add animated background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />

              {/* Content with enhanced animations */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10"
              >
                {/* Your existing content with added motion effects */}
                {!invoiceError && !manualError && (
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="border-b border-gray-700 pb-6"
                  >
                    <PDFPreview data={getCurrentData()} />
                  </motion.div>
                )}

                {/* Rest of your content with similar enhanced animations */}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {getCurrentData() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 rounded-lg overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#272822] p-4 rounded-t-lg flex items-center justify-between"
              >
                <motion.h3
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-white font-medium"
                >
                  JSON Output
                </motion.h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(getCurrentData(), null, 2)
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-400 flex items-center gap-1"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </motion.span>
                  ) : (
                    "Copy JSON"
                  )}
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-h-[500px] overflow-auto"
              >
                <ReactJson
                  src={getCurrentData()}
                  theme="monokai"
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={false}
                  style={{
                    background: "#272822",
                    padding: "1rem",
                    borderRadius: "0 0 0.5rem 0.5rem",
                  }}
                  iconStyle="square"
                  collapsed={false}
                  name={false}
                  shouldCollapse={false}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="px-32px py-32px">
        <UploadView />
      </div>
    </Layout>
  );
}
