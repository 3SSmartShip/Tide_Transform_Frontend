import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import { TrendingUp, TrendingDown, BarChart2, Activity, LogOut, Upload, Mail, FileText, Terminal, HelpCircle, Settings, Home } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import Layout from '../Layout/Layout';

export default function Dashboard() {
  const navigate = useNavigate();
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isNavigating, setIsNavigating] = useState(false);

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

  async function getUsageFrequency(timePeriod = 'week') {
    try {
      const now = new Date();
      let startDate = new Date();

      switch(timePeriod) {
        case 'day':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      const { data, error } = await supabase
        .from('usagelogs')
        .select('*')
        .gte('createdAt', startDate.toISOString())
        .lte('createdAt', now.toISOString())
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.log('No data returned from query');
        return { data: [], count: 0 };
      }

      const groupedData = data.reduce((acc, item) => {
        let dateKey;
        const itemDate = new Date(item.createdAt);

        switch(timePeriod) {
          case 'day':
            dateKey = itemDate.toISOString().split('T')[0];
            break;
          case 'week':
            const startOfWeek = new Date(itemDate);
            startOfWeek.setDate(itemDate.getDate() - itemDate.getDay());
            dateKey = startOfWeek.toISOString().split('T')[0];
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

      console.log('Processed chart data:', chartData);

      return {
        data: chartData,
        count: data.length
      };

    } catch (error) {
      console.error('Error in getUsageFrequency:', error);
      throw error;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getUsageFrequency(selectedPeriod);
        setUsageData(result.data);
        setTotalCount(result.count);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load usage data');
        setUsageData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const metrics = [
    { label: "Total Page", value: 0 },
    { label: "API Created", value: 0 },
    { label: "Pattern Detection Parsing", value: 0 },
    { label: "3S AI Parsing", value: 0 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
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
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111111",
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
              <button className="bg-gray-900 text-gray-300 px-3 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2">
                Filters
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-800">
                    <th className="pb-3 text-gray-400 font-medium">File Name</th>
                    <th className="pb-3 text-gray-400 font-medium">File Size</th>
                    <th className="pb-3 text-gray-400 font-medium">Last Modified</th>
                    <th className="pb-3 text-gray-400 font-medium">Date Added</th>
                    <th className="pb-3 text-gray-400 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 text-white">Tech requirements.pdf</td>
                    <td className="py-4 text-gray-300">200 KB</td>
                    <td className="py-4 text-gray-300">Yesterday</td>
                    <td className="py-4 text-gray-300">10 Dec 2024</td>
                    <td className="py-4 text-gray-300">
                      <div className="flex gap-2">
                        <button className="p-1 hover:text-white"><FileText className="h-4 w-4" /></button>
                        <button className="p-1 hover:text-white"><Upload className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 text-white">Dashboard screenshot.jpg</td>
                    <td className="py-4 text-gray-300">720 KB</td>
                    <td className="py-4 text-gray-300">10 Dec 2024</td>
                    <td className="py-4 text-gray-300">10 Dec 2024</td>
                    <td className="py-4 text-gray-300">
                      <div className="flex gap-2">
                        <button className="p-1 hover:text-white"><FileText className="h-4 w-4" /></button>
                        <button className="p-1 hover:text-white"><Upload className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 text-white">Dashboard prototype recording.mp4</td>
                    <td className="py-4 text-gray-300">16 MB</td>
                    <td className="py-4 text-gray-300">10 Dec 2024</td>
                    <td className="py-4 text-gray-300">10 Dec 2024</td>
                    <td className="py-4 text-gray-300">
                      <div className="flex gap-2">
                        <button className="p-1 hover:text-white"><FileText className="h-4 w-4" /></button>
                        <button className="p-1 hover:text-white"><Upload className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
