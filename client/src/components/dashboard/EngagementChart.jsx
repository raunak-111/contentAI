import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export default function EngagementChart({ data, loading = false }) {
  const { isDark } = useTheme();

  const chartColors = {
    primary: isDark ? '#818cf8' : '#6366f1',
    grid: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    background: isDark ? '#1e293b' : '#ffffff',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-64"
        style={{ color: 'var(--text-muted)' }}
      >
        No engagement data available
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    engagement: item.avgEngagement
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div 
        className="p-3 rounded-lg shadow-lg"
        style={{ 
          background: chartColors.background,
          border: `1px solid ${chartColors.grid}`
        }}
      >
        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              Engagement: {entry.value?.toFixed(2)}
            </span>
          </div>
        ))}
        {payload[0]?.payload?.postCount && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Posts: {payload[0].payload.postCount}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartColors.grid}
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartColors.text, fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: chartColors.text, fontSize: 12 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="engagement"
            stroke={chartColors.primary}
            strokeWidth={2}
            fill="url(#engagementGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
