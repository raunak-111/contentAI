import { useMemo } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? 'PM' : 'AM';
  const hour = i % 12 || 12;
  return `${hour}${ampm}`;
});

export default function Heatmap({ data, loading = false, onCellClick }) {
  // Build heatmap grid
  const grid = useMemo(() => {
    if (!data?.data) return null;

    // Create 7x24 grid
    const gridData = Array(7).fill(null).map(() => Array(24).fill(null));
    
    data.data.forEach(item => {
      if (item.dayIndex >= 0 && item.dayIndex < 7 && item.hour >= 0 && item.hour < 24) {
        gridData[item.dayIndex][item.hour] = {
          value: item.avgEngagement,
          normalizedScore: item.normalizedScore,
          postCount: item.postCount
        };
      }
    });

    return gridData;
  }, [data]);

  const getColor = (normalizedScore) => {
    if (!normalizedScore) return 'var(--surface)';
    
    // Gradient from light to dark purple
    const intensity = normalizedScore / 100;
    if (intensity < 0.2) return 'rgba(99, 102, 241, 0.1)';
    if (intensity < 0.4) return 'rgba(99, 102, 241, 0.25)';
    if (intensity < 0.6) return 'rgba(99, 102, 241, 0.45)';
    if (intensity < 0.8) return 'rgba(99, 102, 241, 0.65)';
    return 'rgba(99, 102, 241, 0.85)';
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex gap-1">
          <div className="w-12" />
          {HOURS.filter((_, i) => i % 3 === 0).map((_, i) => (
            <div key={i} className="skeleton w-8 h-4 flex-1" />
          ))}
        </div>
        {DAYS.map((day, i) => (
          <div key={i} className="flex gap-1">
            <div className="skeleton w-12 h-6" />
            {Array(8).fill(null).map((_, j) => (
              <div key={j} className="skeleton h-6 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!grid) {
    return (
      <div 
        className="flex items-center justify-center py-12"
        style={{ color: 'var(--text-muted)' }}
      >
        No heatmap data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex mb-1">
          <div className="w-10 flex-shrink-0" />
          <div className="flex-1 flex">
            {HOURS.map((hour, i) => (
              <div 
                key={i}
                className="flex-1 text-center text-xs"
                style={{ 
                  color: 'var(--text-muted)',
                  visibility: i % 3 === 0 ? 'visible' : 'hidden'
                }}
              >
                {hour}
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        {grid.map((row, dayIndex) => (
          <div key={dayIndex} className="flex mb-1">
            {/* Day label */}
            <div 
              className="w-10 flex-shrink-0 text-xs font-medium flex items-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {DAYS[dayIndex]}
            </div>

            {/* Cells */}
            <div className="flex-1 flex gap-0.5">
              {row.map((cell, hourIndex) => (
                <div
                  key={hourIndex}
                  className="flex-1 aspect-square heatmap-cell relative group"
                  style={{ 
                    background: getColor(cell?.normalizedScore),
                    minWidth: '16px',
                    minHeight: '16px'
                  }}
                  onClick={() => onCellClick?.({ day: DAYS[dayIndex], hour: hourIndex, ...cell })}
                >
                  {/* Tooltip */}
                  {cell && (
                    <div 
                      className="
                        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                        px-2 py-1 rounded text-xs whitespace-nowrap
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all z-20 pointer-events-none
                      "
                      style={{ 
                        background: 'var(--text-primary)',
                        color: 'var(--background)'
                      }}
                    >
                      <div className="font-medium">{DAYS[dayIndex]} {HOURS[hourIndex]}</div>
                      <div>Engagement: {cell.value?.toFixed(2)}</div>
                      <div>Posts: {cell.postCount}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Low</span>
          <div className="flex gap-0.5">
            {[0.1, 0.25, 0.45, 0.65, 0.85].map((opacity, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm"
                style={{ background: `rgba(99, 102, 241, ${opacity})` }}
              />
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>High</span>
        </div>
      </div>
    </div>
  );
}
