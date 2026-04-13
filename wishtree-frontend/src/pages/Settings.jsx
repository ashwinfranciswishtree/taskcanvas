import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your application preferences</p>
        </div>
      </div>
      
      <div className="glass-panel p-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 transition-colors duration-300">Application Settings</h2>
        
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Email Notifications</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Receive emails when tasks change stages.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Dark Mode</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Toggle deep theme for the dashboard.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
            </label>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <button className="btn-primary">Save Preferences</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
