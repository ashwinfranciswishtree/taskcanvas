import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import FullscreenViewer from '../components/FullscreenViewer';
import { Calendar, Megaphone, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Approval = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [viewerImages, setViewerImages] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?status=Approval');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCheckbox = async (project, field, value) => {
    try {
      await api.put(`/projects/${project.id}/status`, { [field]: value });
      fetchProjects();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleComplete = async (project) => {
    try {
      await api.put(`/projects/${project.id}/status`, { status: 'Completed' });
      toast.success('Project marked as Completed!');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to complete project');
    }
  };

  return (
    <div>
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Approval & Marketing</h1>
        <p className="text-slate-500 mt-2 font-medium">Finalize creatives for marketing campaigns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length === 0 ? (
           <div className="col-span-full py-20 text-center glass-panel">
             <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium text-lg">No tasks pending approval or marketing mapping.</p>
           </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="glass-panel hover:shadow-xl transition-shadow border border-slate-200 flex flex-col overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-4 text-white">
                <h3 className="font-bold text-lg">{project.name}</h3>
                <p className="text-cyan-50 text-sm opacity-90">{project.assigned_designer_name}</p>
              </div>

              <div className="p-6 flex-1 flex flex-col bg-white">
                {project.images && project.images.length > 0 && (
                  <div 
                    className="h-40 w-full rounded-xl bg-cover bg-center mb-6 cursor-pointer border border-slate-200 shadow-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundImage: `url("${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${project.images[0]}")` }}
                    onClick={() => setViewerImages(project.images)}
                  />
                )}
                
                <div className="space-y-4 mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Marketing Actions</h4>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-cyan-50 cursor-pointer transition-colors border border-transparent hover:border-cyan-100 group">
                    <input type="checkbox" checked={project.scheduled_for_ads} onChange={(e) => handleCheckbox(project, 'scheduled_for_ads', e.target.checked)} className="w-5 h-5 accent-cyan-600 rounded" />
                    <Calendar size={18} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
                    <span className="font-medium text-slate-700 group-hover:text-cyan-800">Scheduled</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-cyan-50 cursor-pointer transition-colors border border-transparent hover:border-cyan-100 group">
                    <input type="checkbox" checked={project.used_for_ads} onChange={(e) => handleCheckbox(project, 'used_for_ads', e.target.checked)} className="w-5 h-5 accent-cyan-600 rounded" />
                    <Megaphone size={18} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
                    <span className="font-medium text-slate-700 group-hover:text-cyan-800">Used for Ads</span>
                  </label>
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => handleComplete(project)}
                    className="w-full btn-primary bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500 shadow-cyan-600/30 shadow-lg py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Mark as Completed
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {viewerImages && (
        <FullscreenViewer images={viewerImages} onClose={() => setViewerImages(null)} />
      )}
    </div>
  );
};

export default Approval;
