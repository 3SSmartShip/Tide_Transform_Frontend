import api from '../axios'

export const dashboardStatsService = {
  getActivityStats: async ({ granularity = 'daily', startTime, endTime }) => {
    try {
      console.log('API Request Parameters:', {
        granularity,
        startTime,
        endTime
      });

      const response = await api.get('/api/v1/usage/activity', {
        params: {
          granularity,
          startTime,
          endTime
        }
      });

      console.log(`Raw ${granularity} Response:`, response.data);

      // Transform the response data into the format needed for the chart
      const activities = Object.entries(response.data).map(([date, data]) => ({
        timestamp: data.timestamp,
        usage: {
          ai: data.usage['3S_AI'] || 0,
          pattern: data.usage['PATTERN_MATCH'] || 0
        }
      }));

      console.log(`Processed ${granularity} Activities:`, activities);
      return activities;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      throw error;
    }
  },

  getOverviewStats: async (period = 'weekly') => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const params = {
      startTime: startDate.toISOString(),
      endTime: now.toISOString()
    };

    const response = await api.get('/api/v1/usage/overview', { params });

    // Calculate total pages by summing up total_pages from each item
    const totalPages = response.data.reduce((sum, item) => {
      return sum + parseInt(item.total_pages || 0);
    }, 0);

    return {
      totalPages: totalPages,
      overviewData: response.data
    };
  }
};