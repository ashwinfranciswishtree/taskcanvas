import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LayoutDashboard, MessageSquare, Palette, CheckSquare, Archive, AlertCircle, XCircle, BarChart3 } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass-panel p-6 flex items-center gap-6 hover:shadow-md transition-shadow dark:bg-slate-800/80 dark:border-slate-700/50">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colorClass}`}>
      <Icon size={28} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    feedbackPending: 0,
    creativesPending: 0,
    approvalPending: 0,
    completedTasks: 0,
    overdueTasks: 0,
    rejectedTasks: 0,
    monthlyActivity: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/projects/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, []);

  const maxActivity = Math.max(...(stats.monthlyActivity || []).map(m => m.count), 1);
  const chartData = [...(stats.monthlyActivity || [])].reverse();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Overview of your creative workflow</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Projects" value={stats.totalProjects} icon={LayoutDashboard} colorClass="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20 shadow-lg" />
        <DashboardCard title="Feedback" value={stats.feedbackPending} icon={MessageSquare} colorClass="bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/20 shadow-lg" />
        <DashboardCard title="Creatives" value={stats.creativesPending} icon={Palette} colorClass="bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-purple-500/20 shadow-lg" />
        <DashboardCard title="Approval" value={stats.approvalPending} icon={CheckSquare} colorClass="bg-gradient-to-br from-cyan-400 to-teal-500 shadow-teal-500/20 shadow-lg" />
        <DashboardCard title="Completed" value={stats.completedTasks} icon={Archive} colorClass="bg-gradient-to-br from-emerald-400 to-green-600 shadow-green-500/20 shadow-lg" />
        <DashboardCard title="Rejected Tasks" value={stats.rejectedTasks || 0} icon={XCircle} colorClass="bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/20 shadow-lg" />
        <DashboardCard title="Overdue Tasks" value={stats.overdueTasks} icon={AlertCircle} colorClass="bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20 shadow-lg" />
      </div>

      <div className="mt-12 glass-panel p-8">
         <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-primary/10 rounded-xl text-primary">
             <BarChart3 size={24} />
           </div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Activity Overview</h3>
         </div>
         
         <div className="h-64 flex items-end justify-around gap-4 pt-4 border-b border-slate-200 dark:border-slate-700 pb-2">
           {chartData.length === 0 ? (
             <p className="text-slate-400 dark:text-slate-500 m-auto">Not enough data to display graph.</p>
           ) : (
             chartData.map((data, index) => {
               const heightPercent = (data.count / maxActivity) * 100;
               return (
                 <div key={index} className="flex flex-col items-center w-full group">
                   <div className="relative w-full flex justify-center h-full items-end mx-2">
                     <span className="absolute -top-8 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-sm px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                       {data.count}
                     </span>
                     <div 
                       className="w-full max-w-[4rem] bg-gradient-to-t from-primary/80 to-indigo-400 rounded-t-lg transition-all duration-500 group-hover:from-primary group-hover:to-indigo-500 shadow-sm"
                       style={{ height: `${heightPercent}%`, minHeight: '10%' }}
                     ></div>
                   </div>
                   <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 border-t border-slate-200 dark:border-slate-700 pt-2 w-full text-center">
                     {new Date(data.month + '-01').toLocaleString('default', { month: 'short' })}
                   </span>
                 </div>
               );
             })
           )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
