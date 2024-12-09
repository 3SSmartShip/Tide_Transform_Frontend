import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  LogOut,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BarChart2 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Usage Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <motion.div
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : error ? (
          <motion.div
            className="bg-red-50 p-4 rounded-lg text-red-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm font-medium">Total Requests</h3>
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{totalCount}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm font-medium">Processing Distribution</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-600 mr-1" />
                      <span className="text-sm text-gray-500">AI</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-600 mr-1" />
                      <span className="text-sm text-gray-500">Static</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Bar
                      dataKey="ai"
                      name="AI Processing"
                      fill="#4F46E5"
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
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
