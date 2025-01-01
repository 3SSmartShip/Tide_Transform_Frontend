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
} from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../Layout/Layout";
import { dashboardStatsService } from "../../api/services/dashboardStats";
import AllDocuments from "../AllDocuments/AllDocuments";

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

  const handleDocumentsClick = useCallback(() => {
    navigate("/dashboard/documents");
  }, [navigate]);

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
    let startDate = new Date();

    switch (period) {
      case "daily":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(endDate.getMonth() - 12); // Last 12 months
        break;
      case "yearly":
        startDate.setFullYear(endDate.getFullYear() - 5); // Last 5 years
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const range = {
      startTime: formatDateForAPI(startDate),
      endTime: formatDateForAPI(endDate),
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

        const chartData = activities.map((item) => ({
          date: new Date(item.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            ...(selectedPeriod === "monthly" && { year: "numeric" }),
            ...(selectedPeriod === "yearly" && { year: "numeric" }),
          }),
          ai: item.usage.ai,
          pattern: item.usage.pattern,
        }));

        console.log(`${selectedPeriod} Processed Chart Data:`, chartData);

        // Sort by date
        chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
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
            {metrics.map((metric) => (
              <motion.div
                key={metric.label}
                whileHover={{ scale: 1.02 }}
                className="bg-[#1C2632] p-6 rounded-lg"
              >
                <h3 className="text-gray-400 text-sm">{metric.label}</h3>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {metric.value.toLocaleString()}
                </p>
              </motion.div>
            ))}
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
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Loading...</p>
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
              <div className="h-full flex items-end space-x-4">
                {usageData.map((item, index) => {
                  const maxValue = Math.max(
                    ...usageData.flatMap((d) => [d.ai || 0, d.pattern || 0])
                  );

                  const aiHeight =
                    maxValue > 0 ? ((item.ai || 0) / maxValue) * 100 : 0;
                  const patternHeight =
                    maxValue > 0 ? ((item.pattern || 0) / maxValue) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center justify-end"
                    >
                      <div className="w-full space-y-1">
                        {/* AI Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${aiHeight}%` }}
                          transition={{ duration: 0.5 }}
                          className="w-full relative bg-blue-500"
                          style={{
                            minHeight: item.ai > 0 ? "20px" : "0px",
                            borderRadius: "4px",
                          }}
                        >
                          {item.ai > 0 && (
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                              {item.ai}
                            </span>
                          )}
                        </motion.div>

                        {/* Pattern Match Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${patternHeight}%` }}
                          transition={{ duration: 0.5 }}
                          className="w-full relative bg-green-500"
                          style={{
                            minHeight: item.pattern > 0 ? "20px" : "0px",
                            borderRadius: "4px",
                          }}
                        >
                          {item.pattern > 0 && (
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                              {item.pattern}
                            </span>
                          )}
                        </motion.div>
                      </div>
                      <span className="mt-2 text-xs text-gray-400 whitespace-nowrap">
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

        {/* Document History */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden max-h-28">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-white">
                Document History
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDocumentsClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View All Documents
              </motion.button>
            </div>
            <div className="flex items-center justify-center py-12">
              {/* Removed the Coming Soon message */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
