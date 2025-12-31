import { Clock, Award, TrendingUp } from 'lucide-react';

export default function BestSlots({ slots, loading = false, onSlotClick }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-24" />
            </div>
            <div className="skeleton w-16 h-6 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div 
        className="flex items-center justify-center py-8"
        style={{ color: 'var(--text-muted)' }}
      >
        No optimal time slots found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map((slot, index) => (
        <div
          key={index}
          className="
            flex items-center gap-3 p-3 rounded-lg
            cursor-pointer transition-all
            hover:bg-[var(--surface)] hover:shadow-sm
          "
          onClick={() => onSlotClick?.(slot)}
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Rank Badge */}
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={{ 
              background: index === 0 
                ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                : index === 1 
                  ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)'
                  : index === 2
                    ? 'linear-gradient(135deg, #CD7F32, #B87333)'
                    : 'var(--surface)',
              color: index < 3 ? 'white' : 'var(--text-secondary)'
            }}
          >
            {slot.rank}
          </div>

          {/* Time Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {slot.day} {slot.hourFormatted}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Engagement: {slot.avgEngagement}
              </span>
              <span>
                {slot.postCount} posts analyzed
              </span>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="confidence-score">
            <Award className="w-3 h-3" />
            {slot.confidenceScore}%
          </div>
        </div>
      ))}
    </div>
  );
}
