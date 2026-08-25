import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, Map, Building2, 
  BarChart3, FileSpreadsheet, Users, Settings, Menu, X
} from 'lucide-react';
import clsx from 'clsx';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdminRoute) {
    return (
      <div className="min-h-screen bg-civic-50 font-sans text-gray-900 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-white p-6 text-center text-gray-500 text-sm border-t border-gray-200">
          <p>© {new Date().getFullYear()} Citizen Service Platform. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Complaints', path: '/admin/complaints', icon: FileText },
    { name: 'Map View', path: '/admin/map', icon: Map },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Schemes', path: '/admin/schemes', icon: FileSpreadsheet },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "bg-civic-900 text-white w-64 flex-shrink-0 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-50 md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-4 bg-civic-950">
          <span className="font-bold text-lg truncate">Admin Portal</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive ? "bg-civic-800 text-white" : "text-civic-200 hover:bg-civic-800 hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Menu size={24} />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-600">Logged in as <span className="font-medium text-gray-900">{user?.name || user?.full_name}</span></span>
            <Link to="/" className="text-sm text-civic-600 hover:underline">Exit Admin</Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
