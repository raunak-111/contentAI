import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Check, Lightbulb } from 'lucide-react';

export default function AIPanel({ 
  suggestions = [], 
  loading = false, 
  onApply,
  onGenerate,
  explanation = null,
  showExplanation = true
}) {
  const [expanded, setExpanded] = useState(true);
  const [applyingIndex, setApplyingIndex] = useState(null);

  const handleApply = async (index) => {
    setApplyingIndex(index);
    try {
      await onApply?.(index);
    } finally {
      setApplyingIndex(null);
    }
  };

  return (
    <div className="card">
      <div 
        className="card-header cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            AI Suggestions
          </h3>
        </div>
        <button className="btn btn-ghost btn-sm">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="card-body space-y-4">
          {/* Generate Button */}
          {onGenerate && (
            <button 
              className="btn btn-primary w-full"
              onClick={onGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Headlines
                </>
              )}
            </button>
          )}

          {/* Loading State */}
          {loading && suggestions.length === 0 && (
            <div className="space-y-3">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="ai-suggestion animate-pulse">
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Suggestions List */}
          {!loading && suggestions.length > 0 && (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className={`ai-suggestion ${suggestion.applied ? 'border-[var(--success)]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p 
                        className="font-medium mb-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {suggestion.headline || suggestion.text}
                      </p>
                      {suggestion.reasoning && (
                        <p 
                          className="text-sm"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {suggestion.reasoning}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="confidence-score">
                        {suggestion.score}%
                      </span>
                      {suggestion.applied ? (
                        <span 
                          className="inline-flex items-center gap-1 text-xs font-medium"
                          style={{ color: 'var(--success)' }}
                        >
                          <Check className="w-3 h-3" />
                          Applied
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleApply(index)}
                          disabled={applyingIndex !== null}
                        >
                          {applyingIndex === index ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Suggestions */}
          {!loading && suggestions.length === 0 && !onGenerate && (
            <div 
              className="text-center py-6"
              style={{ color: 'var(--text-muted)' }}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No suggestions available</p>
            </div>
          )}

          {/* AI Explanation */}
          {showExplanation && explanation && (
            <div 
              className="mt-4 p-4 rounded-lg"
              style={{ 
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(99, 102, 241, 0.05))',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--secondary)' }} />
                <div>
                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Why this recommendation?
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
