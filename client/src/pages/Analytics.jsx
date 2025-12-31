import { useState, useEffect } from 'react';
import { RefreshCw, Filter, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Heatmap from '../components/dashboard/Heatmap';
import EngagementChart from '../components/dashboard/EngagementChart';
import TopPostsTable from '../components/dashboard/TopPostsTable';
import BestSlots from '../components/dashboard/BestSlots';
import { analyticsAPI } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444'];

export default function Analytics() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [data, setData] = useState({
    overview: null,
    heatmap: null,
    timeSeries: [],
    topPosts: [],
    bestSlots: [],
    platforms: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      };

      const [overview, heatmap, timeSeries, topPosts, bestSlots, platforms] = await Promise.all([
        analyticsAPI.getOverview(params),
        analyticsAPI.getHeatmap(params),
        analyticsAPI.getTimeSeries({ ...params, granularity: 'day' }),
        analyticsAPI.getTopPosts({ ...params, limit: 10 }),
        analyticsAPI.getBestSlots({ ...params, limit: 5 }),
        analyticsAPI.getPlatformBreakdown(params)
      ]);

      setData({
        overview: overview.data.data,
        heatmap: heatmap.data.data,
        timeSeries: timeSeries.data.data || [],
        topPosts: topPosts.data.data || [],
        bestSlots: bestSlots.data.data || [],
        platforms: platforms.data.data || []
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartColors = {
    text: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? '#334155' : '#e2e8f0',
    bg: isDark ? '#1e293b' : '#ffffff'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div 
        className="p-3 rounded-lg shadow-lg"
        style={{ background: chartColors.bg, border: `1px solid ${chartColors.grid}` }}
      >
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {payload[0]?.payload?.platform}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Posts: {payload[0]?.payload?.postCount}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Avg Engagement: {payload[0]?.payload?.avgEngagement?.toFixed(2)}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="input"
              style={{ width: 'auto' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="input"
              style={{ width: 'auto' }}
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            <Filter className="w-4 h-4" />
            Apply
          </button>
        </div>
        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: data.overview?.totalPosts || 0 },
          { label: 'Total Impressions', value: (data.overview?.totalImpressions || 0).toLocaleString() },
          { label: 'Engagement Rate', value: `${data.overview?.engagementRate || 0}%` },
          { label: 'Total Engagements', value: (data.overview?.totalEngagements || 0).toLocaleString() }
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className="card-body text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {loading ? '-' : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Platform Performance
            </h3>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="skeleton h-64" />
            ) : data.platforms.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.platforms} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="platform" tick={{ fill: chartColors.text, fontSize: 12 }} />
                    <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgEngagement" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>
                No platform data available
              </div>
            )}
          </div>
        </div>

        {/* Post Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Post Distribution
            </h3>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="skeleton h-64" />
            ) : data.platforms.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.platforms}
                      dataKey="postCount"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ platform, percent }) => `${platform} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {data.platforms.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>
                No distribution data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Engagement by Day & Hour
          </h3>
        </div>
        <div className="card-body">
          <Heatmap data={data.heatmap} loading={loading} />
        </div>
      </div>

      {/* Engagement Trend */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Engagement Over Time
          </h3>
        </div>
        <div className="card-body">
          <EngagementChart data={data.timeSeries} loading={loading} />
        </div>
      </div>

      {/* Best Slots & Top Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Optimal Time Slots
            </h3>
          </div>
          <div className="card-body">
            <BestSlots slots={data.bestSlots} loading={loading} />
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Top Performing Posts
            </h3>
          </div>
          <div className="card-body">
            <TopPostsTable posts={data.topPosts} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
