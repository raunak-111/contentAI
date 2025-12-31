import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Sidebar onCollapse={setSidebarCollapsed} />
      
      <main 
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '5rem' : '16rem' }}
      >
        <Header />
        
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
