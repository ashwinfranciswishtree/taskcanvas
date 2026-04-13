import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Palette, 
  CheckSquare, 
  Archive, 
  XCircle,
  Users, 
  Settings,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Designer', 'Manager', 'Digital Marketing'] },
    { name: 'Feedback', path: '/feedback', icon: <MessageSquare size={20} />, roles: ['Admin', 'Designer', 'Manager'] },
    { name: 'Creatives', path: '/creatives', icon: <Palette size={20} />, roles: ['Admin', 'Designer', 'Manager'] },
    { name: 'Approval', path: '/approval', icon: <CheckSquare size={20} />, roles: ['Admin', 'Manager', 'Digital Marketing'] },
    { name: 'Completed', path: '/completed', icon: <Archive size={20} />, roles: ['Admin', 'Designer', 'Manager', 'Digital Marketing'] },
    { name: 'Rejected', path: '/rejected', icon: <XCircle size={20} />, roles: ['Admin', 'Designer', 'Manager'] },
    { name: 'User Management', path: '/users', icon: <Users size={20} />, roles: ['Admin'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, roles: ['Admin'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen fixed top-0 left-0 z-30 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
          Wishtree Creatives
        </h1>
        <button className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
          <NavLink
            onClick={() => setIsOpen(false)}
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-rose-500/10 hover:text-red-600 dark:hover:text-rose-400 rounded-lg font-medium transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
