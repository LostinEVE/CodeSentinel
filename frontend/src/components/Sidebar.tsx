import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  History, 
  Users, 
  Settings, 
  HelpCircle, 
  Info 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { path: '/scans', icon: History, label: 'Scan History' },
  { path: '/team', icon: Users, label: 'Team Access' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/about', icon: Info, label: 'About' },
  { path: '/help', icon: HelpCircle, label: 'Help' },
];

export function Sidebar({ isOpen }: SidebarProps): React.ReactElement {
  const location = useLocation();

  return (
    <aside className={`fixed top-16 left-0 z-40 h-screen transition-transform ${
      isOpen ? 'w-64' : 'w-16'
    } lg:w-64 bg-white border-r border-gray-200`}>
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition duration-75 ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'
                  }`} />
                  <span className={`ml-3 ${isOpen ? 'block' : 'hidden'} lg:block`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
