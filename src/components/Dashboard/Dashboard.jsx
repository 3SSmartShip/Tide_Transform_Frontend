    import React, { useEffect, useState, useCallback } from "react";
    import { useNavigate } from "react-router-dom";
    import { supabase } from "../../config/supabaseClient";
    import { TrendingUp, TrendingDown, BarChart2, Activity, LogOut, Upload, Mail, FileText, Terminal, HelpCircle, Settings, Home } from 'lucide-react';
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
      const [overviewPeriod, setOverviewPeriod] = useState("weekly");
    
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
    
      const handleUpgradePlanClick = () => {
        navigate('/billing', { state: { activeTab: 'plan' } });
      };
    
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
          default:
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
    
      // useEffect for fetching dashboard data
      useEffect(() => {
        const fetchDashboardData = async () => {
          try {
            setLoading(true);
            const activityData = await dashboardStatsService.getActivityStats(selectedPeriod);
          
            const chartData = activityData.activities.map(item => ({
              date: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              }),
              ai: item.ai_count || 0,
              static: item.static_count || 0
            }));
    
            setUsageData(chartData);
          } catch (error) {
            console.error('Error fetching activity data:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchDashboardData();
      }, [selectedPeriod]);
    
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
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
              <div className="h-[400px] w-full bg-[#18181B] p-4 relative">
                {/* Chart Container */}
                <div className="h-full flex items-end space-x-4">
                  {usageData.map((item, index) => {
                    const maxValue = Math.max(...usageData.flatMap(d => [d.ai, d.static]));
                    const aiHeight = (item.ai / maxValue) * 100;
                    const staticHeight = (item.static / maxValue) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end">
                        {/* Bars Group */}
                        <div className="w-full space-y-1">
                          {/* AI Processing Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${aiHeight}%` }}
                            transition={{ duration: 0.5 }}
                            className="w-full bg-green-500 rounded-t-[4px] relative group cursor-pointer"
                            style={{ minHeight: item.ai > 0 ? '20px' : '0px' }}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-[#1C2632] border border-[#374151] rounded-lg p-2 text-sm text-[#F3F4F6] whitespace-nowrap">
                              <p>AI Processing: {item.ai}</p>
                            </div>
                            {/* Value on top of bar */}
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-[#9CA3AF]">
                              {item.ai}
                            </span>
                          </motion.div>
                          
                          {/* Static Processing Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${staticHeight}%` }}
                            transition={{ duration: 0.5 }}
                            className="w-full bg-[#10B981] rounded-t-[4px] relative group cursor-pointer"
                            style={{ minHeight: item.static > 0 ? '20px' : '0px' }}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-[#1C2632] border border-[#374151] rounded-lg p-2 text-sm text-[#F3F4F6] whitespace-nowrap">
                              <p>Static Processing: {item.static}</p>
                            </div>
                            {/* Value on top of bar */}
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-[#9CA3AF]">
                              {item.static}
                            </span>
                          </motion.div>
                        </div>
                        {/* X-axis label */}
                        <span className="mt-2 text-xs text-[#9CA3AF]">
                          {item.date.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="border-t border-[#374151] opacity-10 w-full"
                    />
                  ))}
                </div>
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