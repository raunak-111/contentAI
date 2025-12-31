import { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, RefreshCw, Clock, TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAPI, analyticsAPI } from '../services/api';
import BestSlots from '../components/dashboard/BestSlots';

export default function AIInsights() {
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [bestSlots, setBestSlots] = useState([]);
  const [timingExplanation, setTimingExplanation] = useState(null);
  const [usage, setUsage] = useState(null);

  // Test AI with content
  const [testContent, setTestContent] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotsRes, usageRes] = await Promise.all([
        analyticsAPI.getBestSlots({ limit: 5 }),
        aiAPI.getUsage({ days: 30 })
      ]);

      setBestSlots(slotsRes.data.data || []);
      setUsage(usageRes.data.data || null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get timing explanation
  const handleExplainTiming = async () => {
    setExplaining(true);
    try {
      const response = await aiAPI.explainTiming({});
      setTimingExplanation(response.data.data);
      toast.success('Explanation generated!');
    } catch (error) {
      toast.error('Failed to generate explanation');
    } finally {
      setExplaining(false);
    }
  };

  // Test headline generation
  const handleTestHeadlines = async () => {
    if (!testContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setTestLoading(true);
    try {
      const response = await aiAPI.generateHeadlines({
        content: testContent,
        count: 5
      });
      setTestResults(response.data.data || []);
      toast.success('Headlines generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p style={{ color: 'var(--text-secondary)' }}>
          AI-powered insights and recommendations for your content strategy.
        </p>
        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* AI Usage Stats */}
      {usage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>API Requests</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {usage.summary?.totalRequests || 0}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cache Hit Rate</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--success)' }}>
                {usage.summary?.cacheHitRate || 0}%
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tokens Used</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {(usage.summary?.totalTokens || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Est. Cost (30d)</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--primary)' }}>
                ${usage.summary?.totalCostUSD || '0.00'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timing Insights */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Optimal Timing Analysis
              </h3>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleExplainTiming}
              disabled={explaining}
            >
              {explaining ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Explain Why
            </button>
          </div>
          <div className="card-body space-y-4">
            <BestSlots slots={bestSlots} loading={loading} />

            {timingExplanation && (
              <div 
                className="mt-4 p-4 rounded-lg space-y-3"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(6, 182, 212, 0.05))',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--secondary)' }} />
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      AI Analysis
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {timingExplanation.summary}
                    </p>
                  </div>
                </div>

                {timingExplanation.patterns && (
                  <div>
                    <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Observed Patterns
                    </h5>
                    <ul className="space-y-1">
                      {timingExplanation.patterns.map((pattern, i) => (
                        <li 
                          key={i} 
                          className="text-sm flex items-start gap-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {timingExplanation.recommendations && (
                  <div>
                    <h5 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Recommendations
                    </h5>
                    <ul className="space-y-1">
                      {timingExplanation.recommendations.map((rec, i) => (
                        <li 
                          key={i}
                          className="text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Confidence: {timingExplanation.confidenceLevel || 'Medium'}
                  </span>
                  {timingExplanation.cached && (
                    <span className="badge badge-secondary">Cached</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Headline Generator Test */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Headline Generator
              </h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">Test Content</label>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder="Enter content to generate headlines for..."
                className="input"
                rows={4}
              />
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleTestHeadlines}
              disabled={testLoading || !testContent.trim()}
            >
              {testLoading ? (
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

            {testResults && testResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Generated Headlines
                </h4>
                {testResults.map((item, i) => (
                  <div 
                    key={i}
                    className="ai-suggestion"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {item.text || item.headline}
                        </p>
                        {item.reasoning && (
                          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {item.reasoning}
                          </p>
                        )}
                      </div>
                      <span className="confidence-score">
                        {item.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
