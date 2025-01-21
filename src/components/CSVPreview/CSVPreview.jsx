import { useState } from "react";
import Papa from "papaparse";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

export default function CSVPreview({ data }) {
  const [downloading, setDownloading] = useState(false);
  const result = [];

  const processInvoiceData = (obj) => {
    const result = [];

    if (obj?.data?.data) {
      // Process each page
      Object.entries(obj.data.data).forEach(([pageKey, pageData]) => {
        if (pageKey.startsWith("page_")) {
          const pageNumber = parseInt(pageKey.split("_")[1]) + 1;

          // Add page header
          result.push({ Key: `Page ${pageNumber}`, Value: "" });

          // Add Invoice Header details
          result.push({ Key: "Invoice Details", Value: "" });
          result.push({ Key: "Customer", Value: pageData.customer || "N/A" });
          result.push({ Key: "Date", Value: pageData.date || "N/A" });
          result.push({
            Key: "Invoice Number",
            Value: pageData.invoice_no || "N/A",
          });
          result.push({
            Key: "Order Number",
            Value: pageData.order_no || "N/A",
          });
          result.push({ Key: "Currency", Value: pageData.currency || "N/A" });

          // Add items from this page
          if (pageData.items && pageData.items.length > 0) {
            result.push({ Key: "", Value: "" }); // Empty line for spacing
            result.push({ Key: `Items - Page ${pageNumber}`, Value: "" });

            pageData.items.forEach((item, index) => {
              const itemDetails = [
                `Description: ${item.description || "N/A"}`,
                `Part No: ${item.part_no || "N/A"}`,
                `Quantity: ${item.quantity || "0"}`,
                `Unit Price: ${item.unit_price || "0"} ${
                  item.currency || pageData.currency || "N/A"
                }`,
                `Total Price: ${item.total_price || "0"} ${
                  item.currency || pageData.currency || "N/A"
                }`,
              ].join(" | ");

              result.push({
                Key: `Item ${index + 1}`,
                Value: itemDetails,
              });
            });
          }

          // Add Invoice Summary
          result.push({ Key: "", Value: "" }); // Empty line for spacing
          result.push({ Key: "Invoice Summary", Value: "" });
          result.push({ Key: "Discount", Value: pageData.discount || "0" });
          result.push({
            Key: "Total Amount",
            Value: `${pageData.total_amount || "0"} ${
              pageData.currency || "N/A"
            }`,
          });

          // Add Payment Instructions
          if (pageData.payment_instructions) {
            result.push({ Key: "", Value: "" }); // Empty line for spacing
            result.push({ Key: "Payment Instructions", Value: "" });
            result.push({
              Key: "Company Name",
              Value: pageData.payment_instructions.company_name || "N/A",
            });
            result.push({
              Key: "Bank Name",
              Value: pageData.payment_instructions.bank_name || "N/A",
            });
            result.push({
              Key: "Account Number",
              Value: pageData.payment_instructions.account_no || "N/A",
            });
            result.push({
              Key: "Swift Code",
              Value: pageData.payment_instructions.swift_code || "N/A",
            });
          }
        }
      });
    }

    return result;
  };

  const processData = (obj) => {
    const documentType = obj?.data?.data?.page_0?.type;

    if (!documentType || documentType === "invoice") {
      return processInvoiceData(obj);
    } else {
      // Clear the result array before processing
      result.length = 0;

      const formatKey = (key) => {
        return key
          .replace(/_/g, " ")
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      };

      // Process all pages
      Object.entries(obj?.data?.data || {}).forEach(([pageKey, pageData]) => {
        if (pageKey.startsWith("page_")) {
          // Add page header
          result.push({ Key: "", Value: "" }); // Empty line for spacing
          result.push({
            Key: `Page ${parseInt(pageKey.split("_")[1]) + 1}`,
            Value: "",
          });

          // Process assemblies for this page
          if (pageData.assembly && pageData.assembly.length > 0) {
            processAssembly(pageData.assembly, pageKey);
          }

          // Process spare parts for this page
          if (
            pageData.spare_parts_information &&
            pageData.spare_parts_information.length > 0
          ) {
            processSparePartsInfo(pageData.spare_parts_information, pageKey);
          }

          // Process manufacturer details for this page
          if (
            pageData.manufacturer_contact_details &&
            pageData.manufacturer_contact_details.length > 0
          ) {
            processManufacturerDetails(
              pageData.manufacturer_contact_details,
              pageKey
            );
          }
        }
      });

      return result;
    }
  };

  const processAssembly = (assembly, pageKey) => {
    assembly.forEach((item, assemblyIndex) => {
      // Add assembly main info
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Name`,
        Value: item.name || "N/A",
      });
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Part Number`,
        Value: item.part_number || "N/A",
      });

      // Add maker details
      const maker = item.maker_details;
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Maker Name`,
        Value: maker.name || "N/A",
      });
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Maker Address`,
        Value: maker.address || "N/A",
      });
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Maker Phone`,
        Value: maker.contact?.phone || "N/A",
      });
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Maker Email`,
        Value: maker.contact?.email || "N/A",
      });

      // Add other assembly details
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Serial Number`,
        Value: item.serial_number || "N/A",
      });
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Model`,
        Value: item.model || "N/A",
      });
      result.push({
        Key: `Assembly ${assemblyIndex + 1} Quantity`,
        Value: item.quantity || "N/A",
      });

      // Process parts if present
      if (item.parts && item.parts.length > 0) {
        result.push({
          Key: `Assembly ${assemblyIndex + 1} Parts`,
          Value: "",
        });
        item.parts.forEach((part, index) => {
          result.push({
            Key: `Part ${index + 1}`,
            Value: `${part.name} (${part.part_number}) - Qty: ${part.quantity}${
              part.material ? ` - Material: ${part.material}` : ""
            }${part.weight ? ` - Weight: ${part.weight}` : ""}`,
          });
        });
      }

      // Process subassembly if present
      if (item.subassembly && item.subassembly.length > 0) {
        result.push({
          Key: `Assembly ${assemblyIndex + 1} Subassemblies`,
          Value: "",
        });
        item.subassembly.forEach((sub, index) => {
          result.push({
            Key: `Subassembly ${index + 1}`,
            Value: `${sub.name} (${sub.part_number}) - Qty: ${sub.quantity}`,
          });
        });
      }
    });
  };

  const processSparePartsInfo = (spareParts, pageKey) => {
    if (spareParts.length > 0) {
      result.push({ Key: "Spare Parts Information", Value: "" });
      spareParts.forEach((part, index) => {
        result.push({
          Key: `Spare Part ${index + 1}`,
          Value: `${part.description} (${part.part_number}) - Qty: ${
            part.quantity_in_stock
          }${
            part.compatibility !== "N/A"
              ? ` - Compatibility: ${part.compatibility}`
              : ""
          }${part.price ? ` - Price: ${part.price}` : ""}`,
        });
      });
    }
  };

  const processManufacturerDetails = (manufacturers, pageKey) => {
    if (manufacturers.length > 0) {
      result.push({ Key: "Manufacturer Contact Details", Value: "" });
      manufacturers.forEach((mfg, index) => {
        result.push({
          Key: `Manufacturer ${index + 1}`,
          Value: `${mfg.manufacturer_name} - Address: ${mfg.address} - Phone: ${
            mfg.phone
          } - Email: ${mfg.email}${
            mfg.website !== "N/A" ? ` - Website: ${mfg.website}` : ""
          }`,
        });
      });
    }
  };

  const handleDownloadCSV = () => {
    setDownloading(true);
    try {
      const processedData = processData(data);

      if (!processedData || processedData.length === 0) {
        throw new Error("No data to export");
      }

      const csvData = [
        ["Field Name", "Content"],
        ...processedData.map((item) => [item.Key, item.Value]),
      ];

      const csv = Papa.unparse(csvData, {
        quotes: true,
        delimiter: ",",
        header: true,
        newline: "\r\n",
      });

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csv], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split("T")[0];
      const documentType = data?.data?.data?.page_0?.type || "document";

      link.setAttribute("href", url);
      link.setAttribute("download", `${documentType}_data_${timestamp}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating CSV:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleDownloadCSV}
      disabled={downloading}
      className="flex items-center px-4 py-1.5 mt-14 mb-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 text-m"
    >
      {/* <Download size={20} /> */}
      {downloading ? "Generating CSV..." : "Download CSV"}
    </motion.button>
  );
}
