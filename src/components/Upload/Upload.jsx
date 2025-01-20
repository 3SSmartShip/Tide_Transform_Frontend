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

// PDF specific styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "bold",
  },
  sectionHeader: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    color: "#1F2937",
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 4,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
  },
  label: {
    width: "30%",
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "bold",
  },
  value: {
    width: "70%",
    fontSize: 12,
    color: "#1F2937",
  },
  subsection: {
    marginLeft: 15,
    marginTop: 10,
    padding: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
  },
  subheader: {
    fontSize: 14,
    marginBottom: 8,
    color: "#4B5563",
    fontWeight: "bold",
  },
});

// Updated BeautifiedPDF component
const BeautifiedPDF = ({ jsonData }) => {
  const pageData = jsonData?.data?.data?.page_0;

  if (!pageData) return null;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>Manual Details</Text>

        {/* Assembly Section */}
        {pageData.assembly && pageData.assembly.length > 0 && (
          <>
            <Text style={pdfStyles.sectionHeader}>Assembly Information</Text>
            {pageData.assembly.map((assembly, index) => (
              <View key={index} style={pdfStyles.section}>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Name:</Text>
                  <Text style={pdfStyles.value}>{assembly.name || "N/A"}</Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Part Number:</Text>
                  <Text style={pdfStyles.value}>
                    {assembly.part_number || "N/A"}
                  </Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Model:</Text>
                  <Text style={pdfStyles.value}>{assembly.model || "N/A"}</Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Serial Number:</Text>
                  <Text style={pdfStyles.value}>
                    {assembly.serial_number || "N/A"}
                  </Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Quantity:</Text>
                  <Text style={pdfStyles.value}>
                    {assembly.quantity || "N/A"}
                  </Text>
                </View>

                {/* Maker Details */}
                {assembly.maker_details && (
                  <View style={pdfStyles.subsection}>
                    <Text style={pdfStyles.subheader}>Maker Details</Text>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Name:</Text>
                      <Text style={pdfStyles.value}>
                        {assembly.maker_details.name || "N/A"}
                      </Text>
                    </View>
                    {assembly.maker_details.address && (
                      <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Address:</Text>
                        <Text style={pdfStyles.value}>
                          {assembly.maker_details.address || "N/A"}
                        </Text>
                      </View>
                    )}
                    {assembly.maker_details.contact && (
                      <>
                        {assembly.maker_details.contact.phone && (
                          <View style={pdfStyles.row}>
                            <Text style={pdfStyles.label}>Phone:</Text>
                            <Text style={pdfStyles.value}>
                              {assembly.maker_details.contact.phone || "N/A"}
                            </Text>
                          </View>
                        )}
                        {assembly.maker_details.contact.email && (
                          <View style={pdfStyles.row}>
                            <Text style={pdfStyles.label}>Email:</Text>
                            <Text style={pdfStyles.value}>
                              {assembly.maker_details.contact.email || "N/A"}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Manufacturer Contact Details */}
        {pageData.manufacturer_contact_details &&
          pageData.manufacturer_contact_details.length > 0 && (
            <>
              <Text style={pdfStyles.sectionHeader}>
                Manufacturer Contact Details
              </Text>
              {pageData.manufacturer_contact_details.map(
                (manufacturer, index) => (
                  <View key={index} style={pdfStyles.section}>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Name:</Text>
                      <Text style={pdfStyles.value}>
                        {manufacturer.manufacturer_name || "N/A"}
                      </Text>
                    </View>
                    {manufacturer.address && (
                      <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Address:</Text>
                        <Text style={pdfStyles.value}>
                          {manufacturer.address || "N/A"}
                        </Text>
                      </View>
                    )}
                    {manufacturer.phone && (
                      <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Phone:</Text>
                        <Text style={pdfStyles.value}>
                          {manufacturer.phone || "N/A"}
                        </Text>
                      </View>
                    )}
                    {manufacturer.email && (
                      <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Email:</Text>
                        <Text style={pdfStyles.value}>
                          {manufacturer.email || "N/A"}
                        </Text>
                      </View>
                    )}
                    {manufacturer.website && (
                      <View style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>Website:</Text>
                        <Text style={pdfStyles.value}>
                          {manufacturer.website || "N/A"}
                        </Text>
                      </View>
                    )}
                  </View>
                )
              )}
            </>
          )}
      </Page>
    </Document>
  );
};

// InvoicePDF component
const InvoicePDF = ({ jsonData }) => {
  // Extract all pages data
  const pages = Object.entries(jsonData?.data?.data || {})
    .filter(([key]) => key.startsWith("page_"))
    .map(([_, value]) => value);

  return (
    <Document>
      {pages.map((pageData, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <Text style={styles.header}>Invoice Details</Text>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Customer:</Text>
              <Text style={styles.value}>{pageData.customer}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{pageData.date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice No:</Text>
              <Text style={styles.value}>{pageData.invoice_no}</Text>
            </View>
            {pageData.order_no && (
              <View style={styles.row}>
                <Text style={styles.label}>Order No:</Text>
                <Text style={styles.value}>{pageData.order_no}</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionHeader}>Items</Text>
          {pageData.items?.map((item, index) => (
            <View key={index} style={styles.itemBox}>
              <View style={styles.row}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>{item.description}</Text>
              </View>
              {item.part_no && item.part_no !== "N/A" && (
                <View style={styles.row}>
                  <Text style={styles.label}>Part No</Text>
                  <Text style={styles.value}>{item.part_no}</Text>
                </View>
              )}
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
              <Text style={styles.value}>{pageData.discount}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Total Amount:</Text>
              <Text
                style={styles.value}
              >{`${pageData.currency} ${pageData.total_amount}`}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Payment Instructions</Text>
          <View style={styles.section}>
            {Object.entries(pageData.payment_instructions || {}).map(
              ([key, value]) =>
                value &&
                value !== "N/A" && (
                  <View key={key} style={styles.row}>
                    <Text style={styles.label}>
                      {key.replace(/_/g, " ").toUpperCase()}:
                    </Text>
                    <Text style={styles.value}>{value}</Text>
                  </View>
                )
            )}
          </View>

          {pageIndex < pages.length - 1 && (
            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
              Page {pageIndex + 1} of {pages.length}
            </Text>
          )}
        </Page>
      ))}
    </Document>
  );
};

// PDFPreview component
const PDFPreview = ({ data }) => {
  if (!data || !data.data) {
    return null;
  }

  // Check if it's a manual (has assembly array) or invoice
  const isManual = data?.data?.data?.page_0?.assembly !== undefined;
  const fileName = isManual
    ? `manual_${Date.now()}.pdf`
    : `invoice_${data?.data?.data?.page_0?.invoice_no || "document"}.pdf`;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-white mb-2">PDF Preview</h3>
      <div className="p-4 rounded">
        <PDFDownloadLink
          document={
            isManual ? (
              <ManualPDF jsonData={data} />
            ) : (
              <InvoicePDF jsonData={data} />
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

// New ManualPDF component
const ManualPDF = ({ jsonData }) => {
  const pageData = jsonData?.data?.data?.page_0;

  if (!pageData) return null;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>Manual Details</Text>

        {/* Assembly Section */}
        {pageData.assembly && pageData.assembly.length > 0 && (
          <>
            <Text style={pdfStyles.sectionHeader}>Assembly Information</Text>
            {pageData.assembly.map((assembly, index) => (
              <View key={index} style={pdfStyles.section}>
                {/* Main Assembly Details */}
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Name:</Text>
                  <Text style={pdfStyles.value}>{assembly.name || "N/A"}</Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Part Number:</Text>
                  <Text style={pdfStyles.value}>
                    {assembly.part_number || "N/A"}
                  </Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Model:</Text>
                  <Text style={pdfStyles.value}>{assembly.model || "N/A"}</Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Serial Number:</Text>
                  <Text style={pdfStyles.value}>
                    {assembly.serial_number || "N/A"}
                  </Text>
                </View>
                <View style={pdfStyles.row}>
                  <Text style={pdfStyles.label}>Quantity:</Text>
                  <Text style={pdfStyles.value}>
                    {assembly.quantity || "N/A"}
                  </Text>
                </View>

                {/* Maker Details */}
                {assembly.maker_details && (
                  <View style={pdfStyles.subsection}>
                    <Text style={pdfStyles.subheader}>Maker Details</Text>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Name:</Text>
                      <Text style={pdfStyles.value}>
                        {assembly.maker_details.name || "N/A"}
                      </Text>
                    </View>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Address:</Text>
                      <Text style={pdfStyles.value}>
                        {assembly.maker_details.address || "N/A"}
                      </Text>
                    </View>
                    {assembly.maker_details.contact && (
                      <>
                        <View style={pdfStyles.row}>
                          <Text style={pdfStyles.label}>Phone:</Text>
                          <Text style={pdfStyles.value}>
                            {assembly.maker_details.contact.phone || "N/A"}
                          </Text>
                        </View>
                        <View style={pdfStyles.row}>
                          <Text style={pdfStyles.label}>Email:</Text>
                          <Text style={pdfStyles.value}>
                            {assembly.maker_details.contact.email || "N/A"}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                )}

                {/* Subassembly Section */}
                {assembly.subassembly && assembly.subassembly.length > 0 && (
                  <View style={pdfStyles.subsection}>
                    <Text style={pdfStyles.subheader}>Subassembly Details</Text>
                    {assembly.subassembly.map((sub, subIndex) => (
                      <View key={subIndex} style={pdfStyles.subSection}>
                        <View style={pdfStyles.row}>
                          <Text style={pdfStyles.label}>Name:</Text>
                          <Text style={pdfStyles.value}>
                            {sub.name || "N/A"}
                          </Text>
                        </View>
                        <View style={pdfStyles.row}>
                          <Text style={pdfStyles.label}>Part Number:</Text>
                          <Text style={pdfStyles.value}>
                            {sub.part_number || "N/A"}
                          </Text>
                        </View>
                        <View style={pdfStyles.row}>
                          <Text style={pdfStyles.label}>Quantity:</Text>
                          <Text style={pdfStyles.value}>
                            {sub.quantity || "N/A"}
                          </Text>
                        </View>

                        {/* Parts within Subassembly */}
                        {sub.parts && sub.parts.length > 0 && (
                          <View style={pdfStyles.nestedSubsection}>
                            <Text style={pdfStyles.subheader}>Parts</Text>
                            {sub.parts.map((part, partIndex) => (
                              <View key={partIndex} style={pdfStyles.row}>
                                <Text style={pdfStyles.label}>
                                  Part {partIndex + 1}:
                                </Text>
                                <Text style={pdfStyles.value}>
                                  {`${part.name} (${part.part_number}) - Qty: ${part.quantity}, Material: ${part.material}, Weight: ${part.weight}`}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Parts Section */}
                {assembly.parts && assembly.parts.length > 0 && (
                  <View style={pdfStyles.subsection}>
                    <Text style={pdfStyles.subheader}>Parts</Text>
                    {assembly.parts.map((part, partIndex) => (
                      <View key={partIndex} style={pdfStyles.row}>
                        <Text style={pdfStyles.label}>
                          Part {partIndex + 1}:
                        </Text>
                        <Text style={pdfStyles.value}>
                          {`${part.name} (${part.part_number}) - Qty: ${part.quantity}, Material: ${part.material}, Weight: ${part.weight}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Spare Parts Information */}
        {pageData.spare_parts_information &&
          pageData.spare_parts_information.length > 0 && (
            <>
              <Text style={pdfStyles.sectionHeader}>
                Spare Parts Information
              </Text>
              {pageData.spare_parts_information.map((part, index) => (
                <View key={index} style={pdfStyles.section}>
                  <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Part Number:</Text>
                    <Text style={pdfStyles.value}>
                      {part.part_number || "N/A"}
                    </Text>
                  </View>
                  <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Description:</Text>
                    <Text style={pdfStyles.value}>
                      {part.description || "N/A"}
                    </Text>
                  </View>
                  <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Quantity in Stock:</Text>
                    <Text style={pdfStyles.value}>
                      {part.quantity_in_stock || "N/A"}
                    </Text>
                  </View>
                  <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Compatibility:</Text>
                    <Text style={pdfStyles.value}>
                      {part.compatibility || "N/A"}
                    </Text>
                  </View>
                  <View style={pdfStyles.row}>
                    <Text style={pdfStyles.label}>Price:</Text>
                    <Text style={pdfStyles.value}>{part.price || "N/A"}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

        {/* Manufacturer Contact Details */}
        {pageData.manufacturer_contact_details &&
          pageData.manufacturer_contact_details.length > 0 && (
            <>
              <Text style={pdfStyles.sectionHeader}>
                Manufacturer Contact Details
              </Text>
              {pageData.manufacturer_contact_details.map(
                (manufacturer, index) => (
                  <View key={index} style={pdfStyles.section}>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Name:</Text>
                      <Text style={pdfStyles.value}>
                        {manufacturer.manufacturer_name || "N/A"}
                      </Text>
                    </View>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Address:</Text>
                      <Text style={pdfStyles.value}>
                        {manufacturer.address || "N/A"}
                      </Text>
                    </View>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Phone:</Text>
                      <Text style={pdfStyles.value}>
                        {manufacturer.phone || "N/A"}
                      </Text>
                    </View>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Email:</Text>
                      <Text style={pdfStyles.value}>
                        {manufacturer.email || "N/A"}
                      </Text>
                    </View>
                    <View style={pdfStyles.row}>
                      <Text style={pdfStyles.label}>Website:</Text>
                      <Text style={pdfStyles.value}>
                        {manufacturer.website || "N/A"}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </>
          )}
      </Page>
    </Document>
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

// Add these animation variants at the top of the file
const progressBarVariants = {
  initial: { width: "0%" },
  animate: (percentage) => ({
    width: `${percentage}%`,
    transition: { duration: 0.5, ease: "easeInOut" },
  }),
};

const progressTextVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
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
  const [pageNumbers, setPageNumbers] = useState("");

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
          // Parse the percentage from the status
          const percentage = status?.percentage?.replace("%", "") || "0";
          setJobStatus({
            operation: status?.operation || "Processing",
            percentage: percentage,
          });
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

    // Validate and parse page numbers
    if (!pageNumbers.trim()) {
      setManualError("Please enter page numbers to process");
      return;
    }

    // Parse and validate page numbers
    const pageNumbersArray = pageNumbers
      .split(",")
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num));

    if (pageNumbersArray.length === 0) {
      setManualError("Please enter valid page numbers (e.g., 1,2,3)");
      return;
    }

    const formData = new FormData();
    formData.append("file", manualFiles[0]);
    formData.append("pageNumbers", JSON.stringify(pageNumbersArray)); // Ensure it's properly stringified

    setManualLoading(true);
    setManualError(null);

    try {
      const result = await documentsApi.uploadManual(formData, (status) => {
        setJobStatus({
          operation: status.operation,
          percentage: status.percentage,
        });
      });

      if (result) {
        setManualParsedData({
          data: {
            data: result,
          },
        });
        setManualFiles([]);
        setManualSuccessMessage("Manual processed successfully!");
        setPdfUrl(true);
      }
    } catch (error) {
      console.error("Manual processing error:", error);
      setManualError(
        error.response?.data?.message ||
          error.message ||
          "Error processing manual"
      );
      setManualParsedData(null);
      setPdfUrl(null);
    } finally {
      setManualLoading(false);
      setJobStatus(null);
      // Don't reset pageNumbers here to allow for multiple uploads with same pages
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

  const handlePageNumberInput = (value) => {
    // Remove any non-digit, non-comma, and non-space characters
    const cleanedValue = value.replace(/[^0-9,\s]/g, "");
    setPageNumbers(cleanedValue);
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

        {selectedMode === "manual" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Page Numbers <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                value={pageNumbers}
                onChange={(e) => handlePageNumberInput(e.target.value)}
                placeholder="Enter page numbers (e.g., 1,2,3)"
                className={`px-4 py-2 bg-gray-700 border ${
                  manualError && !pageNumbers.trim()
                    ? "border-red-500"
                    : "border-gray-600"
                } rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
              <p className="text-sm text-gray-400">
                Enter comma-separated page numbers to process (required).
              </p>
            </div>
          </div>
        )}

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
              (selectedMode === "invoice"
                ? invoiceFiles.length === 0
                : manualFiles.length === 0 || !pageNumbers.trim()) ||
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
              : "Transform Manuals"}
          </motion.button>
        </div>

        {(invoiceLoading || manualLoading) && (
          <motion.div
            className="relative flex flex-col items-center mt-8 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Progress Bar Container */}
            <div className="w-full max-w-md h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                variants={progressBarVariants}
                initial="initial"
                animate="animate"
                custom={parseFloat(jobStatus?.percentage || "0")}
              />
            </div>

            {/* Progress Text */}
            <motion.div
              variants={progressTextVariants}
              initial="initial"
              animate="animate"
              className="text-center"
            >
              <motion.p
                className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {jobStatus?.operation || "Processing"}
              </motion.p>
              <p className="text-gray-500 mt-2">
                {jobStatus?.percentage || "0%"} Complete
              </p>
            </motion.div>

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
