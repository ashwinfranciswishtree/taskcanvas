import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import FullscreenViewer from '../components/FullscreenViewer';
import { MessageCircle, History, ArrowRight, Trash2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Creatives = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [viewerImages, setViewerImages] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?status=Creatives');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleReject = async (id) => {
    try {
      await api.put(`/projects/${id}/status`, { is_rejected: 1 });
      toast.success('Task marked as Rejected!');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to reject task');
    }
  };

  const handleDelete = (id) => {
    setProjectToDelete(id);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete}`);
      toast.success('Task deleted successfully');
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleCheckbox = async (project, field, value) => {
    try {
      const updated = { ...project, [field]: value };
      
      const payload = { [field]: value };
      
      // Check if all 3 are now true
      if (
        (field === 'approved' ? value : updated.approved) &&
        (field === 'passed_checks' ? value : updated.passed_checks) &&
        (field === 'client_approval' ? value : updated.client_approval)
      ) {
        payload.status = 'Approval';
      }

      await api.put(`/projects/${project.id}/status`, payload);
      
      if (payload.status === 'Approval') {
        toast.success('All checks passed! Moved to Approval.');
      }
      fetchProjects();
    } catch (err) {
      toast.error('Failed to update project status');
    }
  };

  return (
    <div>
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Creatives</h1>
        <p className="text-slate-500 mt-2 font-medium">Design progression and approvals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length === 0 ? (
           <div className="col-span-full py-20 text-center glass-panel">
             <p className="text-slate-500 font-medium text-lg">No creative tasks in progress.</p>
           </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="glass-panel hover:shadow-lg transition-all duration-300 border-t-4 border-t-fuchsia-500 flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">{project.name}</h3>
                <div className="flex gap-1.5 bg-slate-100/50 dark:bg-slate-800/80 hover:bg-slate-200/50 dark:hover:bg-slate-700/80 backdrop-blur-sm p-1.5 rounded-xl border border-white dark:border-slate-600 transition-all duration-300">
                  <button onClick={() => handleReject(project.id)} className="p-1.5 text-orange-400 hover:text-orange-500 transition-colors" title="Reject"><XCircle size={16}/></button>
                  <button className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-amber-400 transition-colors" title="Comments"><MessageCircle size={16}/></button>
                  <button className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-amber-400 transition-colors" title="History"><History size={16}/></button>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors" title="Delete"><Trash2 size={16}/></button>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {project.images && project.images.length > 0 && (
                  <div 
                    className="h-32 w-full rounded-lg bg-cover bg-center mb-6 cursor-pointer border border-slate-200 shadow-sm"
                    style={{ backgroundImage: `url(http://localhost:5000${project.images[0]})` }}
                    onClick={() => setViewerImages(project.images)}
                  />
                )}
                
                <div className="space-y-4 mt-auto">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Clearance Checklist</h4>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white cursor-pointer transition-colors group">
                    <input type="checkbox" checked={project.approved} onChange={(e) => handleCheckbox(project, 'approved', e.target.checked)} className="w-5 h-5 accent-fuchsia-600 rounded" />
                    <span className="font-medium text-slate-700 group-hover:text-fuchsia-700 transition-colors">Internal Approval</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white cursor-pointer transition-colors group">
                    <input type="checkbox" checked={project.passed_checks} onChange={(e) => handleCheckbox(project, 'passed_checks', e.target.checked)} className="w-5 h-5 accent-fuchsia-600 rounded" />
                    <span className="font-medium text-slate-700 group-hover:text-fuchsia-700 transition-colors">Passed Quality Checks</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white cursor-pointer transition-colors group">
                    <input type="checkbox" checked={project.client_approval} onChange={(e) => handleCheckbox(project, 'client_approval', e.target.checked)} className="w-5 h-5 accent-fuchsia-600 rounded" />
                    <span className="font-medium text-slate-700 group-hover:text-fuchsia-700 transition-colors">Client Approval</span>
                  </label>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {viewerImages && (
        <FullscreenViewer images={viewerImages} onClose={() => setViewerImages(null)} />
      )}

      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 transform scale-100 transition-all">
            <div className="p-6 pb-0 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 border-4 border-rose-50 text-rose-500 shadow-sm">
                <Trash2 size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Task</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Are you absolutely sure you want to completely erase this creative task? This action cannot be undone.
              </p>
            </div>
            
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex gap-3 flex-col sm:flex-row justify-end">
              <button 
                onClick={() => setProjectToDelete(null)} 
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 hover:shadow-md hover:shadow-rose-500/20 transition-all text-sm flex items-center justify-center gap-2"
              >
                Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Creatives;
