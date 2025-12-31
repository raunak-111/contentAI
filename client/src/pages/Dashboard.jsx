import { useState, useEffect } from 'react';
import { Eye, Users, TrendingUp, Clock, Upload, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import KPICard from '../components/dashboard/KPICard';
import Heatmap from '../components/dashboard/Heatmap';
import EngagementChart from '../components/dashboard/EngagementChart';
import TopPostsTable from '../components/dashboard/TopPostsTable';
import BestSlots from '../components/dashboard/BestSlots';
import { analyticsAPI, postsAPI } from '../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [bestSlots, setBestSlots] = useState([]);
  const [importing, setImporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, heatmapRes, timeSeriesRes, topPostsRes, bestSlotsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getHeatmap(),
        analyticsAPI.getTimeSeries({ granularity: 'day' }),
        analyticsAPI.getTopPosts({ limit: 5 }),
        analyticsAPI.getBestSlots({ limit: 5 })
      ]);

      setOverview(overviewRes.data.data);
      setHeatmap(heatmapRes.data.data);
      setTimeSeries(timeSeriesRes.data.data || []);
      setTopPosts(topPostsRes.data.data || []);
      setBestSlots(bestSlotsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Import sample data
  const handleImportSample = async () => {
    setImporting(true);
    try {
      // Fetch sample data from server
      const response = await fetch('/api/posts');
      const existingPosts = await response.json();
      
      if (existingPosts.data?.length > 0) {
        toast.success(`${existingPosts.data.length} posts already loaded`);
        setImporting(false);
        return;
      }

      // If no posts, seed with sample data
      const sampleData = await import('../../../server/src/data/samplePosts.json');
      await postsAPI.import(sampleData.default);
      toast.success('Sample data imported!');
      fetchData();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import sample data. Please run the seed script.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome back! Here's your content performance overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="btn btn-secondary"
            onClick={handleImportSample}
            disabled={importing}
          >
            {importing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import Sample Data
          </button>
          <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Posts"
          value={overview?.totalPosts || 0}
          icon={Eye}
          iconColor="var(--primary)"
          loading={loading}
        />
        <KPICard
          title="Avg Engagement"
          value={overview?.avgEngagement?.toFixed(2) || '0.00'}
          icon={TrendingUp}
          iconColor="var(--success)"
          loading={loading}
        />
        <KPICard
          title="Best Day"
          value={overview?.bestDay || '-'}
          icon={Clock}
          iconColor="var(--secondary)"
          loading={loading}
        />
        <KPICard
          title="Best Hour"
          value={overview?.bestHour ? `${overview.bestHour}:00` : '-'}
          icon={Users}
          iconColor="var(--warning)"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Engagement Heatmap
              </h3>
            </div>
            <div className="card-body">
              <Heatmap data={heatmap} loading={loading} />
            </div>
          </div>
        </div>

        {/* Best Slots */}
        <div>
          <div className="card h-full">
            <div className="card-header">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Optimal Time Slots
              </h3>
            </div>
            <div className="card-body">
              <BestSlots slots={bestSlots} loading={loading} />
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Engagement Trend
          </h3>
        </div>
        <div className="card-body">
          <EngagementChart data={timeSeries} loading={loading} />
        </div>
      </div>

      {/* Top Posts */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Top Performing Posts
          </h3>
        </div>
        <div className="card-body">
          <TopPostsTable posts={topPosts} loading={loading} />
        </div>
      </div>
    </div>
  );
}
