import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User } from '../types';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  onOpenAnalytics: () => void; // 🔥 NEW: Analytics dashboard trigger
}

/**
 * COMPACT & STANDOUT User dropdown menu
 * Clean, elevated design that pops from the background
 */
const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onOpenAnalytics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      const { authService } = await import('../services/authService');
      const result = await authService.signOut();

      if (result.success) {
        console.log('✅ User logged out successfully');
        onLogout();
      } else {
        console.error('❌ Logout error:', result.error);
      }
    } catch (error) {
      console.error('❌ Unexpected logout error:', error);
    } finally {
      setIsOpen(false);
    }
  }, [onLogout]);

  // 🔥 NEW: Handle analytics dashboard opening
  const handleOpenAnalytics = useCallback(() => {
    console.log('📊 Opening analytics dashboard...');
    onOpenAnalytics();
    setIsOpen(false);
  }, [onOpenAnalytics]);

  // Get user initials for avatar
  const getUserInitials = useCallback((name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* COMPACT & ELEVATED user trigger */}
      <button
        onClick={toggleDropdown}
        className="group flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 min-h-[44px] bg-slate-800/90 backdrop-blur-xl rounded-xl border border-cyan-500/40 hover:border-cyan-400/60 hover:bg-slate-700/90 transition-all duration-300 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {/* Compact avatar with glow */}
        <div className="relative">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-[10px] md:text-xs shadow-lg shadow-cyan-500/40">
            {getUserInitials(user.name)}
          </div>
          {/* Status indicator */}
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-slate-800"></div>
        </div>

        {/* Compact name */}
        <span className="hidden sm:block text-sm font-semibold text-cyan-100">
          {user.name.split(' ')[0]}
        </span>

        {/* Clean arrow */}
        <svg
          className={`w-3 h-3 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* COMPACT & CLEAR dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-2xl rounded-xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/30 py-2 z-50">
          {/* Compact user info */}
          <div className="px-3 py-2 border-b border-cyan-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-[10px] md:text-xs">
                {getUserInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs md:text-sm font-bold text-cyan-100 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] md:text-xs text-cyan-400/80 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Compact menu items */}
          <div className="py-1 space-y-1">
            {/* 🔥 NEW: Analytics Dashboard */}
            <button
              onClick={handleOpenAnalytics}
              className="flex items-center gap-2 w-full px-3 py-2 min-h-[44px] text-xs md:text-sm text-cyan-100 hover:bg-purple-500/20 transition-all duration-200 mx-1 rounded-lg group/analytics"
            >
              <svg className="w-4 h-4 text-purple-400 group-hover/analytics:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium">Analytics Dashboard</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="text-[10px] md:text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">
                  New
                </div>
              </div>
            </button>

            {/* Profile */}
            <button
              onClick={() => {
                console.log('Profile clicked');
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 min-h-[44px] text-xs md:text-sm text-cyan-100 hover:bg-cyan-500/20 transition-all duration-200 mx-1 rounded-lg group/profile"
            >
              <svg className="w-4 h-4 text-cyan-400 group-hover/profile:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
              </svg>
              <span>Profile</span>
              <div className="ml-auto text-[10px] md:text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                Soon
              </div>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                console.log('Settings clicked');
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 min-h-[44px] text-xs md:text-sm text-cyan-100 hover:bg-blue-500/20 transition-all duration-200 mx-1 rounded-lg group/settings"
            >
              <svg className="w-4 h-4 text-blue-400 group-hover/settings:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
              </svg>
              <span>Settings</span>
              <div className="ml-auto text-[10px] md:text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                Soon
              </div>
            </button>

            {/* Logout - Clear and distinct */}
            <div className="pt-1 border-t border-cyan-500/20 mx-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 min-h-[44px] text-xs md:text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white transition-all duration-200 rounded-lg border border-red-500/30 hover:border-red-400/50 group/logout"
              >
                <svg className="w-4 h-4 group-hover/logout:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 12.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-1 0v1.5H7V11h1.5a.5.5 0 0 0 0-1h-3a.5.5 0 0 0-.5.5v2z" />
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.5 7.5A.5.5 0 0 1 5 7h3.5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z" />
                </svg>
                <span className="font-medium">Logout</span>
                <div className="ml-auto">
                  <svg className="w-3 h-3 opacity-70 group-hover/logout:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Compact status footer */}
          <div className="px-3 pt-1 border-t border-cyan-500/20">
            <div className="flex items-center justify-between text-[10px] md:text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-400/70">Active</span>
              </div>
              <div className="text-cyan-400/50 text-[10px] md:text-xs">v1.1</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;