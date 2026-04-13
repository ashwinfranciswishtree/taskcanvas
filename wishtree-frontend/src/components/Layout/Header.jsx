import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, Sun, Moon, Menu, Settings, LogOut } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 transition-colors duration-300">
      <div className="flex-1 flex items-center gap-3 w-full max-w-xl">
        <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <Menu size={24} />
        </button>
        <form onSubmit={handleSearch} className="relative group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors cursor-pointer" size={20} onClick={handleSearch} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..." 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-800 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-slate-100"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-6">
        <button onClick={toggleDarkMode} className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-amber-400 transition-colors">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 lg:pl-6 relative" ref={profileRef}>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</div>
            <div className="text-xs text-slate-500 font-medium">{user?.role}</div>
          </div>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:shadow-md transition-shadow select-none"
          >
            {user?.name?.charAt(0)}
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute top-14 right-0 min-w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 sm:hidden">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <div className="py-2">
                <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary transition-colors">
                  <Settings size={16} />
                  Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
