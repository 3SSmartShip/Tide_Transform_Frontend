import api from '../axios'

export const dashboardStatsService = {
    getActivityStats: async (period = 'daily') => {
      const now = new Date()
      let startDate = new Date()
      
      switch(period) {
        case 'day':
          startDate.setDate(now.getDate() - 7)
          break
        case 'week':
          startDate.setDate(now.getDate() - 30)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 3)
          break
      }
  
      const params = {
        granularity: period === 'day' ? 'hourly' : period === 'week' ? 'daily' : 'monthly',
        startTime: startDate.toISOString(),
        endTime: now.toISOString()
      }
  
      const response = await api.get('/api/v1/usage/activity', { params })
      
      // Handle the actual response structure
      const activities = Array.isArray(response.data) ? response.data : 
                        response.data.activities ? response.data.activities : 
                        [response.data]
  
      return {
        activities: activities.map(item => ({
          date: item.timestamp || item.date,
          ai_count: item.ai_processing_count || 0,
          static_count: item.pattern_processing_count || 0
        }))
      }
    }
  }