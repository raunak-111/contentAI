import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Sparkles, 
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/schedule', icon: Calendar, label: 'Schedule' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/ai-insights', icon: Sparkles, label: 'AI Insights' },
];

export default function Sidebar() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full z-40
        flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
      style={{ 
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)'
      }}
    >
      {/* Logo */}
      <div 
        className="h-16 flex items-center justify-between px-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">ContentAI</span>
          </div>
        )}
        {collapsed && (
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-150
                ${isActive 
                  ? 'text-white' 
                  : 'hover:bg-[var(--surface-hover)]'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              style={{
                background: isActive ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                boxShadow: isActive ? 'var(--shadow)' : 'none'
              }}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-colors duration-150
            hover:bg-[var(--surface-hover)]
            ${collapsed ? 'justify-center' : ''}
          `}
          style={{ color: 'var(--text-secondary)' }}
          title={collapsed ? (isDark ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-colors duration-150
            hover:bg-[var(--surface-hover)]
            ${collapsed ? 'justify-center' : ''}
          `}
          style={{ color: 'var(--text-secondary)' }}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
