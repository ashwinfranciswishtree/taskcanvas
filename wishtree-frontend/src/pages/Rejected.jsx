import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import FullscreenViewer from '../components/FullscreenViewer';
import { RefreshCcw, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Rejected = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [viewerImages, setViewerImages] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?is_rejected=1');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch rejected projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRestore = async (id) => {
    try {
      // Revert to Feedback stage
      await api.put(`/projects/${id}/status`, { is_rejected: 0, status: 'Feedback' });
      toast.success('Task successfully restored and moved to Feedback!');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to restore task');
    }
  };

  const handleDelete = (id) => {
    setProjectToDelete(id);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete}`);
      toast.success('Task permanently deleted');
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-200 dark:border-slate-700 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <XCircle className="text-rose-500" size={32} />
            Rejected Files
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Review and restore rejected tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {!Array.isArray(projects) || projects.length === 0 ? (
           <div className="col-span-full py-20 text-center glass-panel">
             <XCircle size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
             <p className="text-slate-500 font-medium text-lg">No rejected tasks found.</p>
           </div>
        ) : (
          projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClickImage={(imgs) => setViewerImages(imgs)}
              actions={
                <div className="flex gap-1.5 bg-white/30 dark:bg-slate-800/60 hover:bg-white/50 dark:hover:bg-slate-700/80 backdrop-blur-lg p-1.5 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border border-white/50 dark:border-slate-600 transition-all duration-300">
                  <button onClick={() => handleRestore(project.id)} className="p-2 bg-white/60 dark:bg-slate-700/60 text-indigo-600 rounded-lg hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" title="Restore to Feedback">
                    <RefreshCcw size={18} />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 bg-white/60 dark:bg-slate-700/60 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" title="Delete Permanently">
                    <Trash2 size={18} />
                  </button>
                </div>
              }
            />
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
              <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Permanently</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Are you absolutely sure you want to completely erase this task? This cannot be undone.
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

export default Rejected;
