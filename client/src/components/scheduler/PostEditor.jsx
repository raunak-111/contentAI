import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Send, Save, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { scheduledAPI, aiAPI } from '../../services/api';
import AIPanel from '../ai/AIPanel';

const platforms = [
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'blog', label: 'Blog' }
];

const statuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
];

export default function PostEditor({ 
  isOpen, 
  onClose, 
  event = null, 
  initialDate = null,
  onSave 
}) {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    headline: '',
    platform: 'twitter',
    scheduledAt: '',
    status: 'draft'
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Initialize form when event or initialDate changes
  useEffect(() => {
    if (event) {
      setFormData({
        content: event.extendedProps?.content || '',
        headline: event.title || '',
        platform: event.extendedProps?.platform || 'twitter',
        scheduledAt: event.start ? formatDateTimeLocal(new Date(event.start)) : '',
        status: event.extendedProps?.status || 'draft'
      });
      setAiSuggestions(event.extendedProps?.aiSuggestions || []);
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        content: '',
        headline: '',
        scheduledAt: formatDateTimeLocal(new Date(initialDate))
      }));
      setAiSuggestions([]);
    }
  }, [event, initialDate]);

  const formatDateTimeLocal = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateHeadlines = async () => {
    if (!formData.content.trim()) {
      toast.error('Please enter content first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await aiAPI.generateHeadlines({
        content: formData.content,
        platform: formData.platform,
        count: 5
      });
      setAiSuggestions(response.data.data || []);
      toast.success('Headlines generated!');
    } catch (error) {
      toast.error('Failed to generate headlines');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplySuggestion = (index) => {
    const suggestion = aiSuggestions[index];
    if (suggestion) {
      setFormData(prev => ({ ...prev, headline: suggestion.text || suggestion.headline }));
      setAiSuggestions(prev => prev.map((s, i) => ({
        ...s,
        applied: i === index
      })));
      toast.success('Headline applied!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (!formData.scheduledAt) {
      toast.error('Schedule time is required');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        aiSuggestions
      };

      if (event?.id) {
        await scheduledAPI.update(event.id, data);
        toast.success('Post updated!');
      } else {
        await scheduledAPI.create(data);
        toast.success('Post scheduled!');
      }

      onSave?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="card-header">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {event ? 'Edit Scheduled Post' : 'Schedule New Post'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card-body space-y-4">
            {/* Content */}
            <div>
              <label className="label">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your post content..."
                className="input"
                rows={4}
                required
              />
            </div>

            {/* Headline */}
            <div>
              <label className="label">Headline / Subject</label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="Enter or generate a headline..."
                className="input"
              />
            </div>

            {/* Platform & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Platform *</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="input select"
                  required
                >
                  {platforms.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input select"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schedule Time */}
            <div>
              <label className="label">Schedule Time *</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* AI Suggestions */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <AIPanel
                suggestions={aiSuggestions}
                loading={aiLoading}
                onGenerate={handleGenerateHeadlines}
                onApply={handleApplySuggestion}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {event ? 'Update' : 'Schedule'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
