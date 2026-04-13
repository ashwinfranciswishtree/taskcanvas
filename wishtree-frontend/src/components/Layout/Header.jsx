import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, Sun, Moon, Menu, Settings, LogOut, X, Activity } from 'lucide-react';
import api from '../../services/api';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/projects/notifications');
        setNotifications(res.data);
      } catch (error) {
        console.error('Failed to fetch notifications');
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors cursor-pointer hover:scale-110 active:scale-95" size={20} onClick={handleSearch} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..." 
            className="w-full bg-slate-50/80 dark:bg-slate-900 border border-transparent focus:bg-white dark:focus:bg-slate-800 pl-11 pr-10 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all dark:text-slate-100 shadow-sm shadow-slate-200/20 dark:shadow-none"
          />
           {searchQuery && (
            <button 
              type="button" 
              onClick={() => {
                setSearchQuery('');
                if(window.location.pathname === '/search') navigate('/');
              }} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 p-1.5 rounded-full transition-all"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-6">
        <button onClick={toggleDarkMode} className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-amber-400 transition-colors bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700 hover:shadow-sm">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
            className={`relative p-2 transition-all rounded-full border ${isNotificationsOpen ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-600 hover:shadow-sm dark:hover:text-slate-200'}`}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm animate-pulse"></span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute top-12 right-0 w-80 max-h-[400px] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 transform origin-top-right transition-all z-50 animate-in fade-in slide-in-from-top-2 custom-scrollbar">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-md top-0 sticky z-10 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Activity Feed
                </h3>
                <span className="text-xs font-bold tracking-wide bg-primary/15 text-primary px-2.5 py-1 rounded-full">{notifications.length} New</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No recent activity.</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group">
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-tight">
                        <span className="text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{n.user_name}</span> {n.action.toLowerCase()}
                      </p>
                      <div className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-medium">
                        <span className="truncate max-w-[120px]">{n.project_name}</span>
                        {n.to_status && <span className="bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">{n.to_status}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-4 lg:pl-6 relative" ref={profileRef}>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</div>
            <div className="text-xs text-slate-500 font-medium tracking-wide">{user?.role}</div>
          </div>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 cursor-pointer hover:shadow-indigo-500/50 hover:scale-105 transition-all select-none ring-2 ring-white dark:ring-slate-800 z-10"
          >
            {user?.name?.charAt(0)}
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute top-14 right-0 min-w-[220px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transform origin-top-right transition-all z-50 animate-in fade-in zoom-in-95">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/80 sm:hidden">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{user?.name}</p>
                <p className="text-xs text-indigo-500 font-bold tracking-wide uppercase mt-1">{user?.role}</p>
              </div>
              <div className="p-2 space-y-1">
                <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary transition-all">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Settings size={16} /></div>
                  Account Settings
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1 mx-2"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                  <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg"><LogOut size={16} /></div>
                  Sign Out
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
