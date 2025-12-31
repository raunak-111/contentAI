import { Post } from '../models/index.js';

class AnalyticsService {
  /**
   * Get overview KPIs (avg engagement, best time, best day, total posts)
   */
  async getOverview(startDate, endDate) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    const [overview, bestDay, bestHour] = await Promise.all([
      Post.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            avgEngagement: { $avg: '$engagementScore' },
            totalImpressions: { $sum: '$metrics.impressions' },
            totalLikes: { $sum: '$metrics.likes' },
            totalComments: { $sum: '$metrics.comments' },
            totalShares: { $sum: '$metrics.shares' },
            totalClicks: { $sum: '$metrics.clicks' }
          }
        }
      ]),
      this.getBestDay(dateFilter),
      this.getBestHour(dateFilter)
    ]);

    const stats = overview[0] || {
      totalPosts: 0,
      avgEngagement: 0,
      totalImpressions: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalClicks: 0
    };

    return {
      totalPosts: stats.totalPosts,
      avgEngagement: Math.round(stats.avgEngagement * 100) / 100,
      totalImpressions: stats.totalImpressions,
      totalEngagements: stats.totalLikes + stats.totalComments + stats.totalShares + stats.totalClicks,
      bestDay: bestDay?.day || null,
      bestHour: bestHour?.hour || null,
      engagementRate: stats.totalImpressions > 0 
        ? Math.round(((stats.totalLikes + stats.totalComments + stats.totalShares + stats.totalClicks) / stats.totalImpressions) * 10000) / 100 
        : 0
    };
  }

  /**
   * Get best day of week
   */
  async getBestDay(dateFilter = {}) {
    const result = await Post.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dayOfWeek: '$publishedAt' },
          avgEngagement: { $avg: '$weightedScore' },
          postCount: { $sum: 1 }
        }
      },
      { $sort: { avgEngagement: -1 } },
      { $limit: 1 }
    ]);

    if (!result.length) return null;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      day: days[result[0]._id - 1],
      dayIndex: result[0]._id - 1,
      avgEngagement: Math.round(result[0].avgEngagement * 100) / 100,
      postCount: result[0].postCount
    };
  }

  /**
   * Get best hour of day
   */
  async getBestHour(dateFilter = {}) {
    const result = await Post.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $hour: '$publishedAt' },
          avgEngagement: { $avg: '$weightedScore' },
          postCount: { $sum: 1 }
        }
      },
      { $sort: { avgEngagement: -1 } },
      { $limit: 1 }
    ]);

    if (!result.length) return null;

    return {
      hour: result[0]._id,
      hourFormatted: this.formatHour(result[0]._id),
      avgEngagement: Math.round(result[0].avgEngagement * 100) / 100,
      postCount: result[0].postCount
    };
  }

  /**
   * Get engagement heatmap (day vs hour)
   */
  async getHeatmap(startDate, endDate) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    const result = await Post.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$publishedAt' },
            hour: { $hour: '$publishedAt' }
          },
          avgEngagement: { $avg: '$weightedScore' },
          postCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } }
    ]);

    // Transform to 2D array format for heatmap
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmapData = [];
    
    // Find max for normalization
    const maxEngagement = Math.max(...result.map(r => r.avgEngagement), 1);

    for (const item of result) {
      heatmapData.push({
        day: days[item._id.dayOfWeek - 1],
        dayIndex: item._id.dayOfWeek - 1,
        hour: item._id.hour,
        hourFormatted: this.formatHour(item._id.hour),
        avgEngagement: Math.round(item.avgEngagement * 100) / 100,
        normalizedScore: Math.round((item.avgEngagement / maxEngagement) * 100),
        postCount: item.postCount
      });
    }

    return {
      data: heatmapData,
      days,
      hours: Array.from({ length: 24 }, (_, i) => this.formatHour(i)),
      maxEngagement: Math.round(maxEngagement * 100) / 100
    };
  }

  /**
   * Get time-series engagement trend
   */
  async getTimeSeries(startDate, endDate, granularity = 'day') {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    let groupBy;
    if (granularity === 'hour') {
      groupBy = {
        year: { $year: '$publishedAt' },
        month: { $month: '$publishedAt' },
        day: { $dayOfMonth: '$publishedAt' },
        hour: { $hour: '$publishedAt' }
      };
    } else if (granularity === 'week') {
      groupBy = {
        year: { $year: '$publishedAt' },
        week: { $week: '$publishedAt' }
      };
    } else {
      groupBy = {
        year: { $year: '$publishedAt' },
        month: { $month: '$publishedAt' },
        day: { $dayOfMonth: '$publishedAt' }
      };
    }

    const result = await Post.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupBy,
          avgEngagement: { $avg: '$engagementScore' },
          totalImpressions: { $sum: '$metrics.impressions' },
          totalEngagements: {
            $sum: {
              $add: ['$metrics.likes', '$metrics.comments', '$metrics.shares', '$metrics.clicks']
            }
          },
          postCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    return result.map(item => ({
      date: this.buildDateFromGroup(item._id, granularity),
      avgEngagement: Math.round(item.avgEngagement * 100) / 100,
      totalImpressions: item.totalImpressions,
      totalEngagements: item.totalEngagements,
      postCount: item.postCount
    }));
  }

  /**
   * Get top performing posts
   */
  async getTopPosts(limit = 10, startDate, endDate) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    return Post.find(dateFilter)
      .sort({ weightedScore: -1 })
      .limit(limit)
      .select('content headline platform publishedAt metrics engagementScore weightedScore tags tone')
      .lean();
  }

  /**
   * Get optimal publishing slots with confidence scores
   */
  async getBestSlots(limit = 5, startDate, endDate) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    const result = await Post.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$publishedAt' },
            hour: { $hour: '$publishedAt' }
          },
          avgEngagement: { $avg: '$weightedScore' },
          postCount: { $sum: 1 },
          stdDev: { $stdDevPop: '$weightedScore' }
        }
      },
      {
        $match: { postCount: { $gte: 2 } } // Require at least 2 posts for confidence
      },
      { $sort: { avgEngagement: -1 } },
      { $limit: limit }
    ]);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const maxEngagement = Math.max(...result.map(r => r.avgEngagement), 1);

    return result.map((item, index) => {
      // Calculate confidence based on sample size and std deviation
      const sampleConfidence = Math.min(item.postCount / 10, 1); // Max at 10 posts
      const variabilityConfidence = item.stdDev > 0 
        ? Math.max(1 - (item.stdDev / item.avgEngagement), 0.3) 
        : 0.5;
      const confidenceScore = Math.round((sampleConfidence * 0.4 + variabilityConfidence * 0.6) * 100);

      return {
        rank: index + 1,
        day: days[item._id.dayOfWeek - 1],
        dayIndex: item._id.dayOfWeek - 1,
        hour: item._id.hour,
        hourFormatted: this.formatHour(item._id.hour),
        avgEngagement: Math.round(item.avgEngagement * 100) / 100,
        normalizedScore: Math.round((item.avgEngagement / maxEngagement) * 100),
        postCount: item.postCount,
        confidenceScore
      };
    });
  }

  /**
   * Get platform breakdown
   */
  async getPlatformBreakdown(startDate, endDate) {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    return Post.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$platform',
          postCount: { $sum: 1 },
          avgEngagement: { $avg: '$engagementScore' },
          totalImpressions: { $sum: '$metrics.impressions' }
        }
      },
      { $sort: { avgEngagement: -1 } }
    ]).then(results => results.map(r => ({
      platform: r._id,
      postCount: r.postCount,
      avgEngagement: Math.round(r.avgEngagement * 100) / 100,
      totalImpressions: r.totalImpressions
    })));
  }

  // Utility methods
  buildDateFilter(startDate, endDate) {
    const filter = {};
    if (startDate || endDate) {
      filter.publishedAt = {};
      if (startDate) filter.publishedAt.$gte = new Date(startDate);
      if (endDate) filter.publishedAt.$lte = new Date(endDate);
    }
    return filter;
  }

  formatHour(hour) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:00 ${ampm}`;
  }

  buildDateFromGroup(group, granularity) {
    if (granularity === 'week') {
      // Approximate week to first day
      const date = new Date(group.year, 0, 1 + group.week * 7);
      return date.toISOString().split('T')[0];
    }
    const date = new Date(group.year, (group.month || 1) - 1, group.day || 1, group.hour || 0);
    return date.toISOString();
  }
}

export default new AnalyticsService();
