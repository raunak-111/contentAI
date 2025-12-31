import { useState, useEffect, useCallback } from 'react';
import { Download, Plus, Undo2, Trash2, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ContentCalendar from '../components/calendar/ContentCalendar';
import PostEditor from '../components/scheduler/PostEditor';
import { scheduledAPI, publishAPI, exportAPI } from '../services/api';

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [lastDroppedEvent, setLastDroppedEvent] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Fetch calendar events
  const fetchEvents = useCallback(async (start, end) => {
    setLoading(true);
    try {
      const now = new Date();
      const startDate = start || new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = end || new Date(now.getFullYear(), now.getMonth() + 2, 0);

      const response = await scheduledAPI.getCalendarEvents({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load scheduled content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setEditorOpen(true);
  };

  // Handle date click
  const handleDateClick = (info) => {
    setSelectedEvent(null);
    setSelectedDate(info.date);
    setEditorOpen(true);
  };

  // Handle event drop (reschedule)
  const handleEventDrop = async ({ id, newStart, revert }) => {
    try {
      await scheduledAPI.update(id, {
        scheduledAt: newStart.toISOString()
      });
      
      setLastDroppedEvent({ id, revert });
      toast.success(
        <div className="flex items-center gap-2">
          <span>Post rescheduled</span>
          <button 
            className="underline font-medium"
            onClick={() => handleUndo(id)}
          >
            Undo
          </button>
        </div>,
        { duration: 5000 }
      );
      
      fetchEvents();
    } catch (error) {
      revert();
      toast.error('Failed to reschedule post');
    }
  };

  // Undo reschedule
  const handleUndo = async (id) => {
    try {
      await scheduledAPI.undoReschedule(id);
      toast.success('Schedule restored');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to undo');
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await exportAPI.toCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scheduled-content-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported!');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Publish selected
  const handlePublish = async (id) => {
    try {
      await publishAPI.publish(id);
      toast.success('Published successfully!');
      fetchEvents();
    } catch (error) {
      toast.error('Publish failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Drag and drop to reschedule posts. Click on a date to create new content.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export CSV
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDate(new Date());
              setEditorOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <div className="card-body p-4">
          <ContentCalendar
            events={events}
            loading={loading}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
          />
        </div>
      </div>

      {/* Post Editor Modal */}
      <PostEditor
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        event={selectedEvent}
        initialDate={selectedDate}
        onSave={fetchEvents}
      />
    </div>
  );
}
