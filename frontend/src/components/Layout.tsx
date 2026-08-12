import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ArrowRightLeft, ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'DASHBOARD', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'PURCHASES', path: '/purchases', icon: <Package size={20} /> },
    { name: 'TRANSFERS', path: '/transfers', icon: <ArrowRightLeft size={20} /> },
    { name: 'ASSIGNMENTS', path: '/assignments', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <div className="flex h-screen w-screen bg-stencil-bg bg-technical-grid bg-grid-sm text-stencil-ink font-sans selection:bg-stencil-ink selection:text-stencil-bg">
      {/* Sidebar - Technical Drawing Style */}
      <aside className="w-64 border-r border-stencil-ink flex flex-col relative z-10 bg-stencil-bg/95 backdrop-blur-sm">
        <div className="p-6 border-b border-stencil-ink">
          <h1 className="font-stencil text-3xl tracking-widest text-stencil-ink">MAMS</h1>
          <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">
            Field Manual // Logic System
          </div>
        </div>
        
        <nav className="flex-1 p-6 flex flex-col gap-3">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 p-3 text-sm font-bold uppercase tracking-widest text-left border ${
                location.pathname === item.path 
                  ? 'border-stencil-ink bg-stencil-ink text-stencil-bg' 
                  : 'border-transparent hover:border-stencil-ink hover:border-dashed'
              } transition-all duration-200`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-stencil-ink text-xs font-mono font-bold uppercase tracking-wider">
          <div className="mb-2 opacity-60">OP: {user?.role}</div>
          <div className="mb-6 opacity-60">BASE: {user?.baseId.slice(0, 8)}...</div>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full p-3 border-2 border-stencil-ink hover:bg-stencil-ink hover:text-stencil-bg transition-colors font-bold uppercase tracking-widest"
          >
            <LogOut size={16} />
            DISENGAGE
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar / Crate Label */}
        <header className="h-16 border-b border-stencil-ink flex items-center justify-between px-8 bg-stencil-bg/95 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-6 font-stencil text-lg tracking-widest">
            <span>[ CAT: LOGISTICS ]</span>
            <span className="text-stencil-ink/30">/</span>
            <span>[ BASE: {user?.baseId.slice(0, 8)} ]</span>
            <span className="text-stencil-ink/30">/</span>
            <span className="text-stencil-olive">[ STATUS: SECURE ]</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
