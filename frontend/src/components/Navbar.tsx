import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Shield, User } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps): React.ReactElement {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">CodeSentinel</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`hover:text-primary transition-colors ${
              location.pathname === '/' ? 'text-primary font-medium' : 'text-gray-600'
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`hover:text-primary transition-colors ${
              location.pathname === '/dashboard' ? 'text-primary font-medium' : 'text-gray-600'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/scans"
            className={`hover:text-primary transition-colors ${
              location.pathname === '/scans' ? 'text-primary font-medium' : 'text-gray-600'
            }`}
          >
            Scans
          </Link>
          <Link
            to="/team"
            className={`hover:text-primary transition-colors ${
              location.pathname === '/team' ? 'text-primary font-medium' : 'text-gray-600'
            }`}
          >
            Team
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/settings"
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
