import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  iconColor = 'var(--primary)',
  loading = false 
}) {
  const getTrendIcon = () => {
    if (!change || change === 0) return <Minus className="w-4 h-4" />;
    return change > 0 
      ? <TrendingUp className="w-4 h-4" /> 
      : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!change || change === 0) return 'var(--text-muted)';
    return change > 0 ? 'var(--success)' : 'var(--danger)';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-8 w-32" />
              <div className="skeleton h-3 w-20" />
            </div>
            <div className="skeleton w-12 h-12 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p 
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {title}
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change !== undefined && (
              <div 
                className="flex items-center gap-1 text-sm font-medium"
                style={{ color: getTrendColor() }}
              >
                {getTrendIcon()}
                <span>{Math.abs(change)}%</span>
                {changeLabel && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div 
              className="p-3 rounded-xl"
              style={{ 
                background: `${iconColor}15`,
                color: iconColor
              }}
            >
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
