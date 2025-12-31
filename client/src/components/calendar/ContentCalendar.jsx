import { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useTheme } from '../../context/ThemeContext';

const platformColors = {
  twitter: { bg: '#1DA1F2', border: '#1A94DA' },
  linkedin: { bg: '#0A66C2', border: '#0958A8' },
  instagram: { bg: '#E4405F', border: '#D62F4E' },
  facebook: { bg: '#1877F2', border: '#1567D3' },
  blog: { bg: '#FF6B6B', border: '#E55C5C' }
};

const statusColors = {
  draft: { bg: '#6B7280', border: '#4B5563' },
  scheduled: { bg: '#3B82F6', border: '#2563EB' },
  published: { bg: '#10B981', border: '#059669' },
  failed: { bg: '#EF4444', border: '#DC2626' }
};

export default function ContentCalendar({
  events = [],
  loading = false,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize
}) {
  const calendarRef = useRef(null);
  const { isDark } = useTheme();
  const [currentView, setCurrentView] = useState('dayGridMonth');

  // Handle event styling
  const eventContent = (eventInfo) => {
    const { platform, status } = eventInfo.event.extendedProps;
    const colors = platformColors[platform] || statusColors[status] || statusColors.draft;
    
    return (
      <div 
        className="px-2 py-1 rounded text-xs font-medium truncate w-full"
        style={{ 
          background: colors.bg,
          borderLeft: `3px solid ${colors.border}`,
          color: 'white'
        }}
        title={eventInfo.event.title}
      >
        {eventInfo.event.title}
      </div>
    );
  };

  // Handle drag and drop
  const handleEventDrop = (info) => {
    const { event, oldEvent, revert } = info;
    
    if (onEventDrop) {
      onEventDrop({
        id: event.id,
        newStart: event.start,
        newEnd: event.end,
        oldStart: oldEvent?.start,
        revert
      });
    }
  };

  return (
    <div className={`calendar-container ${isDark ? 'dark' : ''}`}>
      {loading && (
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ background: 'rgba(var(--background), 0.7)' }}
        >
          <div className="skeleton w-32 h-8" />
        </div>
      )}
      
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={currentView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        events={events}
        eventContent={eventContent}
        editable={true}
        droppable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={3}
        weekends={true}
        nowIndicator={true}
        eventClick={(info) => onEventClick?.(info.event)}
        dateClick={(info) => onDateClick?.(info)}
        eventDrop={handleEventDrop}
        eventResize={onEventResize}
        viewDidMount={(info) => setCurrentView(info.view.type)}
        height="auto"
        aspectRatio={1.8}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        slotDuration="01:00:00"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        dayHeaderFormat={{
          weekday: 'short',
          day: 'numeric'
        }}
      />
    </div>
  );
}
