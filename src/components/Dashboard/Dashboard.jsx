import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  LogOut,
  Upload,
  Mail,
  FileText,
  Terminal,
  HelpCircle,
  Settings,
  Home,
  Copy,
  Trash2,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../Layout/Layout";
import { dashboardStatsService } from "../../api/services/dashboardStats";
import AllDocuments from "../AllDocuments/AllDocuments";
import { documentHistoryService } from "../../api/services/documentHistory";

const DocumentLoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-full"
  >
    {[1, 2, 3].map((index) => (
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

export default function Dashboard() {
  // State declarations
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [isNavigating, setIsNavigating] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [metrics, setMetrics] = useState([
    { label: "Total Pages", value: 0 },
    { label: "Pattern Detection Parsing", value: 0 },
    { label: "3S AI Parsing", value: 0 },
  ]);
  const [overviewPeriod, setOverviewPeriod] = useState("weekly");
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(null);

  const navigate = useNavigate();

  const handleNavigation = useCallback(
    (path) => {
      setIsNavigating(true);
      navigate(path, { replace: true });
      setIsNavigating(false);
    },
    [navigate]
  );

  const handleUploadClick = () => {
    handleNavigation("/dashboard/upload");
  };

  const handleApiClick = () => {
    handleNavigation("/dashboard/api");
  };

  const handleUpgradePlanClick = () => {
    navigate("/billing", { state: { activeTab: "plan" } });
  };

  // Helper function to format dates
  const formatDateForAPI = (date) => {
    return date.toISOString().split(".")[0] + "Z";
  };

  // Get date range based on selected period
  const getDateRange = (period) => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Set to end of day

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Set to start of day

    switch (period) {
      case "daily":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(endDate.getMonth() - 12);
        break;
      case "yearly":
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const range = {
      startTime: startDate.toISOString().split(".")[0] + "Z",
      endTime: endDate.toISOString().split(".")[0] + "Z",
    };

    console.log(`Date Range for ${period}:`, range);
    return range;
  };

  // Function declarations
  async function getUsageFrequency(timePeriod = "week") {
    const now = new Date();
    let startDate = new Date();

    // Configure date ranges based on period
    switch (timePeriod) {
      case "day":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
        break;
      case "week":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 30
        );
        break;
      case "month":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        );
        break;
      default:
        break;
    }

    // Format to exact ISO 8601 specification
    const startTime = startDate.toISOString().split(".")[0] + "Z"; // 2024-01-01T00:00:00Z format
    const endTime = now.toISOString().split(".")[0] + "Z"; // 2024-01-31T23:59:59Z format

    try {
      const { data, error } = await supabase
        .from("usagelogs")
        .select("*")
        .gte("createdAt", startTime)
        .lte("createdAt", endTime)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      const groupedData = data?.reduce((acc, item) => {
        let dateKey;
        const itemDate = new Date(item.createdAt);

        switch (timePeriod) {
          case "day":
            dateKey = itemDate.toISOString().split("T")[0];
            break;
          case "week":
            const weekStart = new Date(itemDate);
            weekStart.setDate(itemDate.getDate() - itemDate.getDay());
            dateKey = weekStart.toISOString().split("T")[0];
            break;
          case "month":
            dateKey = `${itemDate.getFullYear()}-${String(
              itemDate.getMonth() + 1
            ).padStart(2, "0")}`;
            break;
          default:
            dateKey = itemDate.toISOString().split("T")[0];
        }

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            ai: 0,
            static: 0,
          };
        }

        if (item.type?.toLowerCase() === "ai") {
          acc[dateKey].ai += 1;
        } else {
          acc[dateKey].static += 1;
        }

        return acc;
      }, {});

      const chartData = Object.values(groupedData)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((item) => ({
          ...item,
          ai: item.ai || 0,
          pattern: item.pattern || 0,
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: timePeriod === "month" ? "numeric" : undefined,
          }),
        }));

      return {
        data: chartData,
        count: data?.length || 0,
      };
    } catch (error) {
      console.error("Error fetching usage data:", error);
      throw error;
    }
  }

  // useEffect for fetching activity data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { startTime, endTime } = getDateRange(selectedPeriod);

        const activities = await dashboardStatsService.getActivityStats({
          granularity: selectedPeriod,
          startTime,
          endTime,
        });

        console.log(`${selectedPeriod} Raw Activities:`, activities);

        if (!activities || activities.length === 0) {
          console.log(`No ${selectedPeriod} data available`);
          setUsageData([]);
          return;
        }

        const chartData = activities.map((item) => {
          // Parse the timestamp and adjust to local timezone
          const date = new Date(item.timestamp);
          // Subtract one day from the display date
          date.setDate(date.getDate() - 1);

          // Format date based on selected period
          let dateDisplay;
          switch (selectedPeriod) {
            case "monthly":
              dateDisplay = date.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              });
              break;
            case "yearly":
              dateDisplay = date.toLocaleDateString("en-US", {
                year: "numeric",
              });
              break;
            default: // daily
              dateDisplay = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
          }

          return {
            timestamp: date.toISOString(),
            date: dateDisplay,
            ai: item.usage.ai,
            pattern: item.usage.pattern,
          };
        });

        console.log(`${selectedPeriod} Processed Chart Data:`, chartData);

        // Sort by timestamp to ensure correct ordering
        chartData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setUsageData(chartData);
      } catch (error) {
        console.error(`Error fetching ${selectedPeriod} data:`, error);
        setError("Failed to fetch activity data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  // useEffect for fetching overview data
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const overviewData = await dashboardStatsService.getOverviewStats(
          overviewPeriod
        );

        // Update metrics with the overview data
        setMetrics([
          {
            label: "Total Pages",
            value: overviewData.totalPages || 0,
          },
          {
            label: "Pattern Detection Parsing",
            value:
              overviewData.overviewData.find(
                (item) => item.type === "PATTERN_MATCH"
              )?.total_usage || 0,
          },
          {
            label: "3S AI Parsing",
            value:
              overviewData.overviewData.find((item) => item.type === "3S_AI")
                ?.total_usage || 0,
          },
        ]);

        setTotalPages(overviewData.totalPages || 0);
      } catch (error) {
        console.error("Error fetching overview data:", error);
        setError("Failed to fetch overview data");
      }
    };

    fetchOverviewData();
  }, [overviewPeriod]);

  const handleCopy = async (fileName) => {
    try {
      await navigator.clipboard.writeText(fileName);
      setCopiedDoc(fileName);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = (fileName) => {
    setRecentDocuments(
      recentDocuments.filter((doc) => doc.fileName !== fileName)
    );
  };

  const handleViewAllDocuments = () => {
    navigate("/dashboard/documents");
  };

  const handleDropdown = (fileName) => {
    setExpandedRow(fileName);
  };

  // Update useEffect for fetching recent documents
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        setDocumentsLoading(true);
        const response = await documentHistoryService.getDocumentHistory({
          type: "3S_AI",
          page: 1,
          limit: 3, // Only get first 3 documents
        });

        if (!response.documents || response.documents.length === 0) {
          console.log("No documents found");
          setRecentDocuments([]);
          return;
        }

        setRecentDocuments(response.documents);
      } catch (error) {
        console.error("Failed to fetch recent documents:", error);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchRecentDocuments();
  }, []);

  return (
    <Layout>
      <div className="px-32px py-32px space-y-6">
        {/* Overview Section */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Overview</h2>
            <select
              value={overviewPeriod}
              onChange={(e) => setOverviewPeriod(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:border-gray-700"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              // Loading skeleton animations
              <>
                {[1, 2, 3].map((index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-[#1C2632] p-6 rounded-lg"
                  >
                    <div className="h-4 w-24 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
                  </motion.div>
                ))}
              </>
            ) : (
              // Actual metrics
              metrics.map((metric) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#1C2632] p-6 rounded-lg"
                >
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-sm"
                  >
                    {metric.label}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-2 text-3xl font-semibold text-white"
                  >
                    {metric.value.toLocaleString()}
                  </motion.p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-white">Activity</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:border-gray-700"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="h-[400px] w-full bg-[#18181B] p-4 relative">
            {loading ? (
              <div className="h-full flex items-end justify-between px-8">
                {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-end"
                    style={{ width: "60px" }}
                  >
                    <div className="w-full flex space-x-1 justify-center h-[250px] items-end">
                      {/* AI Bar Loading Animation */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{
                          height: ["20px", "180px", "20px"],
                          opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.1,
                        }}
                        className="w-8 relative bg-blue-500/30 rounded-md"
                      />

                      {/* Pattern Match Bar Loading Animation */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{
                          height: ["20px", "100px", "20px"],
                          opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.1,
                        }}
                        className="w-8 relative bg-green-500/30 rounded-md"
                      />
                    </div>
                    {/* Date Loading Animation */}
                    <motion.div
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="mt-4 h-4 w-16 bg-gray-700 rounded"
                    />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-400">{error}</p>
              </div>
            ) : usageData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No data available</p>
              </div>
            ) : (
              <div className="h-full flex items-end justify-between px-8">
                {usageData.map((item, index) => {
                  const maxAiValue = Math.max(
                    ...usageData.map((d) => d.ai || 0)
                  );
                  const maxPatternValue = Math.max(
                    ...usageData.map((d) => d.pattern || 0)
                  );

                  const aiHeight =
                    item.ai === 0 ? 20 : ((item.ai || 0) / maxAiValue) * 200;
                  const patternHeight =
                    item.pattern === 0
                      ? 20
                      : ((item.pattern || 0) / maxPatternValue) * 200;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-end"
                      style={{ width: "60px" }}
                    >
                      <div className="w-full flex space-x-1 justify-center h-[250px] items-end">
                        {/* AI Bar */}
                        <div className="relative">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${aiHeight}px` }}
                            transition={{ duration: 0.5 }}
                            className="w-8 relative bg-blue-500"
                            style={{
                              height: `${aiHeight}px`,
                              borderRadius: "4px",
                              opacity: item.ai === 0 ? 0.3 : 1,
                            }}
                          >
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                              {item.ai}
                            </span>
                          </motion.div>
                        </div>

                        {/* Pattern Match Bar */}
                        <div className="relative">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${patternHeight}px` }}
                            transition={{ duration: 0.5 }}
                            className="w-8 relative bg-green-500"
                            style={{
                              height: `${patternHeight}px`,
                              borderRadius: "4px",
                              opacity: item.pattern === 0 ? 0.3 : 1,
                            }}
                          >
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                              {item.pattern}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      <span className="mt-4 text-xs text-gray-400 whitespace-nowrap">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-400">3S AI</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
              <span className="text-sm text-gray-400">Pattern Match</span>
            </div>
          </div>
        </div>

        {/* Recent Documents Section */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Recent Documents
            </h2>
            <button
              onClick={() => navigate("/dashboard/documents")}
              className="text-blue-500 hover:text-blue-400 text-sm"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            {documentsLoading ? (
              // Loading skeleton for table
              <div className="w-full">
                {[1, 2, 3].map((index) => (
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
                    <div className="px-6 py-4 flex items-center space-x-8">
                      <div className="h-4 w-48 bg-zinc-800 rounded"></div>
                      <div className="h-4 w-16 bg-zinc-800 rounded"></div>
                      <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                      <div className="h-4 w-32 bg-zinc-800 rounded"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : recentDocuments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No recent documents found
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-zinc-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">File Name</th>
                    <th className="px-6 py-4 text-left">Pages</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.map((doc, index) => (
                    <motion.tr
                      key={doc.fileName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4 text-white">{doc.fileName}</td>
                      <td className="px-6 py-4 text-white">
                        {doc.transforms?.[0]?.pages || doc.pages || "N/A"}
                      </td>
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
                      <td className="px-6 py-4 text-white">{doc.dateAdded}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
