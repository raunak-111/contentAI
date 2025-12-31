import { useLocation } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';

const pageTitles = {
  '/': 'Dashboard',
  '/schedule': 'Content Schedule',
  '/analytics': 'Analytics',
  '/ai-insights': 'AI Insights',
};

export default function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'ContentAI';

  return (
    <header 
      className="h-16 flex items-center justify-between px-6"
      style={{ 
        background: 'var(--background)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      {/* Left - Page Title */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="input pl-10 w-64"
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-[var(--surface)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Bell className="w-5 h-5" />
          <span 
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--danger)' }}
          />
        </button>

        {/* User */}
        <button
          className="flex items-center gap-2 p-1.5 rounded-lg transition-colors hover:bg-[var(--surface)]"
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
}
