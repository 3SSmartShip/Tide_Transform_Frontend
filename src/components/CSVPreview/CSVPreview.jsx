import { useState } from "react";
import Papa from "papaparse";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

export default function CSVPreview({ data }) {
  const [downloading, setDownloading] = useState(false);

  const processInvoiceData = (obj) => {
    const result = [];

    // Helper function to combine pages data
    const combinePages = (data) => {
      const allItems = [];
      let invoiceDetails = null;

      Object.entries(data).forEach(([key, page]) => {
        if (key.startsWith("page_")) {
          // Use the first page for invoice details
          if (!invoiceDetails) {
            invoiceDetails = page;
          }
          // Combine items from all pages
          if (page.items) {
            allItems.push(...page.items);
          }
        }
      });

      return { ...invoiceDetails, items: allItems };
    };

    if (obj?.data?.data) {
      const invoiceData = combinePages(obj.data.data);

      // Invoice Header Information
      result.push({ Key: "Invoice Details", Value: "" });
      result.push({ Key: "Customer", Value: invoiceData.customer || "N/A" });
      result.push({ Key: "Date", Value: invoiceData.date || "N/A" });
      result.push({
        Key: "Invoice Number",
        Value: invoiceData.invoice_no || "N/A",
      });
      result.push({
        Key: "Order Number",
        Value: invoiceData.order_no || "N/A",
      });

      // Items Header
      result.push({ Key: "", Value: "" }); // Empty line for spacing
      result.push({
        Key: "Items",
        Value:
          "Part No. | Description | Quantity | Unit Price | Currency | Total Price",
      });

      // Items Details
      invoiceData.items.forEach((item, index) => {
        result.push({
          Key: `Item ${index + 1}`,
          Value: `${item.part_no} | ${item.description} | ${item.quantity} | ${item.unit_price} | ${item.currency} | ${item.total_price}`,
        });
      });

      // Summary
      result.push({ Key: "", Value: "" }); // Empty line for spacing
      result.push({ Key: "Summary", Value: "" });
      result.push({
        Key: "Discount",
        Value: `${invoiceData.currency} ${invoiceData.discount}`,
      });
      result.push({
        Key: "Total Amount",
        Value: `${invoiceData.currency} ${invoiceData.total_amount}`,
      });

      // Payment Instructions
      result.push({ Key: "", Value: "" }); // Empty line for spacing
      result.push({ Key: "Payment Instructions", Value: "" });
      const payment = invoiceData.payment_instructions;
      result.push({
        Key: "Company Name",
        Value: payment.company_name || "N/A",
      });
      result.push({ Key: "Bank Name", Value: payment.bank_name || "N/A" });
      result.push({
        Key: "Account Number",
        Value: payment.account_no || "N/A",
      });
      result.push({ Key: "Swift Code", Value: payment.swift_code || "N/A" });
    }

    return result;
  };

  const processData = (obj) => {
    // Check the type of document
    const documentType = obj?.data?.data?.page_0?.type;

    if (documentType === "invoice") {
      return processInvoiceData(obj);
    } else {
      const result = [];

      const formatKey = (key) => {
        return key
          .replace(/_/g, " ")
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
      };

      const processAssembly = (assembly) => {
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
                Value: `${part.name} (${part.part_number}) - Qty: ${
                  part.quantity
                }${part.material ? ` - Material: ${part.material}` : ""}${
                  part.weight ? ` - Weight: ${part.weight}` : ""
                }`,
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

      const processSparePartsInfo = (spareParts) => {
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

      const processManufacturerDetails = (manufacturers) => {
        if (manufacturers.length > 0) {
          result.push({ Key: "Manufacturer Contact Details", Value: "" });
          manufacturers.forEach((mfg, index) => {
            result.push({
              Key: `Manufacturer ${index + 1}`,
              Value: `${mfg.manufacturer_name} - Address: ${
                mfg.address
              } - Phone: ${mfg.phone} - Email: ${mfg.email}${
                mfg.website !== "N/A" ? ` - Website: ${mfg.website}` : ""
              }`,
            });
          });
        }
      };

      if (obj?.data?.data?.page_0) {
        const manualData = obj.data.data.page_0;

        if (manualData.assembly) {
          processAssembly(manualData.assembly);
        }

        if (manualData.spare_parts_information) {
          processSparePartsInfo(manualData.spare_parts_information);
        }

        if (manualData.manufacturer_contact_details) {
          processManufacturerDetails(manualData.manufacturer_contact_details);
        }
      }

      return result;
    }
  };

  const handleDownloadCSV = () => {
    setDownloading(true);
    try {
      const processedData = processData(data);

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
      className="flex items-center bg-blue-500 text-white px-4 py-1 mt-12 rounded hover:bg-blue-600 transition-colors"
    >
      <Download size={20} />
      {downloading ? "Generating CSV..." : "Download CSV"}
    </motion.button>
  );
}
