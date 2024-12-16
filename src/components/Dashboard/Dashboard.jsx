import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import { TrendingUp, TrendingDown, BarChart2, Activity, LogOut, Upload, Mail, FileText, Terminal, HelpCircle, Settings, Home } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import Layout from '../Layout/Layout';
import { dashboardStatsService } from '../../api/services/dashboardStats';
import AllDocuments from '../AllDocuments/AllDocuments';

export default function Dashboard() {
  // State declarations
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isNavigating, setIsNavigating] = useState(false);
  const [metrics, setMetrics] = useState([
    { label: "Total Pages", value: 0 },
    { label: "API Created", value: 0 },
    { label: "Pattern Detection Parsing", value: 0 },
    { label: "3S AI Parsing", value: 0 },
  ]);

  const navigate = useNavigate();

  const handleNavigation = useCallback((path) => {
    setIsNavigating(true);
    navigate(path, { replace: true });
    setIsNavigating(false);
  }, [navigate]);

  const handleUploadClick = () => {
    handleNavigation('/dashboard/upload');
  };

  const handleApiClick = () => {
    handleNavigation('/dashboard/api');
  };

  const handleDocumentsClick = useCallback(() => {
    navigate('/dashboard/documents');
  }, [navigate]);

  // Function declarations
  async function getUsageFrequency(timePeriod = 'week') {
    const now = new Date();
    let startDate = new Date();

    // Configure date ranges based on period
    switch(timePeriod) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
    }

    // Format to exact ISO 8601 specification
    const startTime = startDate.toISOString().split('.')[0] + 'Z';  // 2024-01-01T00:00:00Z format
    const endTime = now.toISOString().split('.')[0] + 'Z';         // 2024-01-31T23:59:59Z format

    try {
      const { data, error } = await supabase
        .from('usagelogs')
        .select('*')
        .gte('createdAt', startTime)
        .lte('createdAt', endTime)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      const groupedData = data?.reduce((acc, item) => {
        let dateKey;
        const itemDate = new Date(item.createdAt);

        switch(timePeriod) {
          case 'day':
            dateKey = itemDate.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(itemDate);
            weekStart.setDate(itemDate.getDate() - itemDate.getDay());
            dateKey = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            dateKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            dateKey = itemDate.toISOString().split('T')[0];
        }

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            ai: 0,
            static: 0
          };
        }

        if (item.type?.toLowerCase() === 'ai') {
          acc[dateKey].ai += 1;
        } else {
          acc[dateKey].static += 1;
        }

        return acc;
      }, {});

      const chartData = Object.values(groupedData)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: timePeriod === 'month' ? 'numeric' : undefined
          })
        }));

      return {
        data: chartData,
        count: data?.length || 0
      };

    } catch (error) {
      console.error('Error fetching usage data:', error);
      throw error;
    }
  }
  // useEffect
  // Update the useEffect for fetching dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const activityData = await dashboardStatsService.getActivityStats(selectedPeriod)
      
        const chartData = activityData.activities.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          ai: item.ai_count || 0,
          static: item.static_count || 0
        }))

        setUsageData(chartData)
      } catch (error) {
        console.error('Error fetching activity data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedPeriod])

  // Return statement inside the component function
  return (
    <Layout>
      <div className="px-8 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              whileHover={{ scale: 1.02 }}
              className="bg-[#1C2632] p-6 rounded-lg"
            >
              <h3 className="text-gray-400 text-sm">{metric.label}</h3>
              <p className="mt-2 text-3xl font-semibold text-white">{metric.value.toLocaleString()}</p>
            </motion.div>
          ))}
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
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={usageData}
                style={{ backgroundColor: '#18181B' }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="#374151" 
                  opacity={0.1}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  style={{ backgroundColor: '#18181B' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  style={{ backgroundColor: '#18181B' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1C2632",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Bar
                  dataKey="ai"
                  name="AI Processing"
                  fill="#EEFF00"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="static"
                  name="Static Processing"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Document History */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-white">Document History</h2>
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
              <p className="text-xl text-gray-400 font-medium">Coming Soon...</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}