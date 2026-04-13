import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import FullscreenViewer from '../components/FullscreenViewer';
import { RotateCcw, Image as ImageIcon, History } from 'lucide-react';
import toast from 'react-hot-toast';

const Completed = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [viewerImages, setViewerImages] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?status=Completed');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleMoveBack = async (id) => {
    try {
      await api.put(`/projects/${id}/status`, { status: 'Feedback' });
      toast.success('Project sent back to Feedback');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to move project back');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (project.assigned_designer_name && project.assigned_designer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!dateFilter) return matchesSearch;
    
    const projectDate = project.created_at ? new Date(project.created_at).toISOString().split('T')[0] : null;
    return matchesSearch && projectDate === dateFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-200 dark:border-slate-700 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Completed Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Archive of all finished creative tasks</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="date" 
            className="input-field max-w-[200px]" 
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Search by name or designer..." 
            className="input-field w-full sm:w-64" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
           <div className="col-span-full py-20 text-center glass-panel">
             <p className="text-slate-500 font-medium text-lg">No completed projects found.</p>
           </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="glass-panel border-t-4 border-t-emerald-500 flex flex-col group relative">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">By {project.assigned_designer_name}</p>
                  </div>
                  <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                    Completed
                  </div>
                </div>

                {project.images && project.images.length > 0 ? (
                  <div 
                    className="h-32 w-full rounded-lg bg-cover bg-center mb-4 cursor-pointer shadow-sm relative overflow-hidden group/img"
                    style={{ backgroundImage: `url("${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${project.images[0]}")` }}
                    onClick={() => setViewerImages(project.images)}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                      <ImageIcon className="text-white opacity-0 group-hover/img:opacity-100 drop-shadow-md" size={24} />
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-full rounded-lg bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                    No Images
                  </div>
                )}
                
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 mt-auto">
                  <button className="btn-secondary w-full flex justify-center items-center gap-2 py-2">
                    <History size={16} />
                    View Timeline
                  </button>
                  <button 
                    onClick={() => handleMoveBack(project.id)}
                    className="w-full flex justify-center items-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium text-sm transition-colors border border-transparent hover:border-red-100 mt-2"
                  >
                    <RotateCcw size={16} />
                    Move back to Feedback
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

export default Completed;
