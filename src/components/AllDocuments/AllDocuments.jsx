"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, Trash2, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Layout from "../Layout/Layout";
import { documentHistoryService } from "@/api/services/documentHistory";
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme
import 'prismjs/components/prism-json'; // JSON syntax support

export default function DocumentTable() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [sortField, setSortField] = useState("dateAdded");
  const [isAsc, setIsAsc] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [copiedDoc, setCopiedDoc] = useState(null);

  const jsonRef = useRef({});

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  useEffect(() => {
    if (expandedRow) {
      Prism.highlightElement(jsonRef.current[expandedRow]);
    }
  }, [expandedRow]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const docs = await documentHistoryService.getDocumentHistory({
        type: "3S_AI",
        page,
        limit,
      });

      if (!docs) {
        setError("No documents found");
        return;
      }

      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized error
        window.location.href = "/login";
      } else {
        setError("Failed to fetch documents. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setIsAsc(!isAsc);
    } else {
      setSortField(field);
      setIsAsc(true);
    }
  };

  const handleCopy = async (doc) => {
    try {
      const jsonString = JSON.stringify(doc.response, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopiedDoc(doc.fileName);
      setTimeout(() => {
        setCopiedDoc(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy JSON:", err);
    }
  };

  const handleDropdown = (fileName) => {
    if (expandedRow === fileName) {
      setExpandedRow(null);
    } else {
      setExpandedRow(fileName);
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (isAsc) {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const LoadingSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            y: 0,
          }}
          transition={{
            opacity: {
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            },
            y: {
              duration: 0.4,
              delay: index * 0.1,
            },
          }}
          className="border-b border-zinc-800"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-8 w-full">
              <div className="h-4 w-48 bg-zinc-800 rounded"></div>
              <div className="h-4 w-16 bg-zinc-800 rounded"></div>
              <div className="h-4 w-24 bg-zinc-800 rounded"></div>
              <div className="h-4 w-32 bg-zinc-800 rounded"></div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="h-8 w-8 bg-zinc-800 rounded-full"></div>
                <div className="h-8 w-8 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <Layout>
      <div className="min-full px-32px py-32px text-white">
        <div className="mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Document History</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="w-4 h-4" />
              Filter
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-lg overflow-hidden"
          >
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="p-8 text-center text-red-400">{error}</div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center">No documents found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th
                      className="px-6 py-4 text-left cursor-pointer hover:bg-zinc-700"
                      onClick={() => handleSort("fileName")}
                    >
                      <div className="flex items-center gap-2">
                        File Name
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            sortField === "fileName" && !isAsc
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left cursor-pointer hover:bg-zinc-700"
                      onClick={() => handleSort("pages")}
                    >
                      <div className="flex items-center gap-2">
                        Pages
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            sortField === "pages" && !isAsc ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left cursor-pointer hover:bg-zinc-700"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            sortField === "status" && !isAsc ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left cursor-pointer hover:bg-zinc-700"
                      onClick={() => handleSort("dateAdded")}
                    >
                      <div className="flex items-center gap-2">
                        Date Added
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            sortField === "dateAdded" && !isAsc
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDocuments.map((doc, index) => (
                    <>
                      <motion.tr
                        key={doc.fileName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-zinc-800 hover:bg-zinc-800/50"
                      >
                        <td className="px-6 py-4">{doc.fileName}</td>
                        <td className="px-6 py-4">{doc.pages}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              doc.status === "completed"
                                ? "bg-green-500/20 text-green-500"
                                : doc.status === "processing"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {doc.status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">{doc.dateAdded}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-zinc-700 rounded-full relative"
                              onClick={() => handleCopy(doc)}
                            >
                              <AnimatePresence mode="wait">
                                {copiedDoc === doc.fileName ? (
                                  <motion.div
                                    key="check"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="text-green-500"
                                  >
                                    <Check className="w-4 h-4" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="copy"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-zinc-700 rounded-full"
                              onClick={() => handleDropdown(doc.fileName)}
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  expandedRow === doc.fileName
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                      {expandedRow === doc.fileName && (
                        <tr className="bg-zinc-800/30">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="overflow-x-auto rounded-lg bg-[#1E1E1E] p-4">
                              <pre className="language-json">
                                <code
                                  ref={el => jsonRef.current[doc.fileName] = el}
                                  className="text-sm whitespace-pre-wrap break-words"
                                >
                                  {JSON.stringify(doc.response, null, 2)}
                                </code>
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
