import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import FullscreenViewer from '../components/FullscreenViewer';
import { Plus, Edit2, Trash2, CheckCircle, MessageSquare, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Feedback = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [viewerImages, setViewerImages] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assigned_designer_id: '',
    priority: 'Medium',
    approved: false
  });
  const [editFormData, setEditFormData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [files, setFiles] = useState([]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?status=Feedback');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to fetch projects');
    }
  };

  const fetchUsers = async () => {
    try {
      if (user.role === 'Admin') {
        const res = await api.get('/users');
        setUsers(res.data.filter(u => u.role === 'Designer'));
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('assigned_designer_id', formData.assigned_designer_id);
      data.append('priority', formData.priority);
      
      files.forEach(file => {
        data.append('images', file);
      });

      const res = await api.post('/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // If approved, instantly move to creatives
      if (formData.approved) {
        await api.put(`/projects/${res.data.id}/status`, { status: 'Creatives', approved: true });
        toast.success('Task created and moved to Creatives!');
      } else {
        toast.success('Feedback task created!');
      }

      setIsModalOpen(false);
      setFormData({ name: '', description: '', assigned_designer_id: '', priority: 'Medium', approved: false });
      setFiles([]);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/projects/${id}/status`, { status: 'Creatives', approved: true });
      toast.success('Task approved and moved to Creatives');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to move task');
    }
  };

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

  const openEditModal = (project) => {
    setEditFormData({
      id: project.id,
      name: project.name,
      description: project.description || '',
      assigned_designer_id: project.assigned_designer_id || '',
      priority: project.priority || 'Medium',
      replaceImages: false
    });
    setFiles([]); // Reset files array before editing
    setIsEditModalOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', editFormData.name);
      data.append('description', editFormData.description);
      data.append('assigned_designer_id', editFormData.assigned_designer_id);
      data.append('priority', editFormData.priority);
      data.append('replaceImages', editFormData.replaceImages);
      
      files.forEach(file => {
        data.append('images', file);
      });

      await api.put(`/projects/${editFormData.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Task updated successfully');
      setIsEditModalOpen(false);
      setFiles([]);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Feedback</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Gather requirements and initiate tasks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Task (End Feedback)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {!Array.isArray(projects) || projects.length === 0 ? (
           <div className="col-span-full py-20 text-center glass-panel">
             <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium text-lg">No pending feedback tasks right now.</p>
             <p className="text-slate-400 mt-2">Click the '+ Create Task' button above to start.</p>
           </div>
        ) : (
          projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClickImage={(imgs) => setViewerImages(imgs)}
              actions={
                <div className="flex gap-1.5 bg-white/30 dark:bg-slate-800/60 hover:bg-white/50 dark:hover:bg-slate-700/80 backdrop-blur-lg p-1.5 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border border-white/50 dark:border-slate-600 transition-all duration-300">
                  <button onClick={() => handleReject(project.id)} className="p-2 bg-white/60 dark:bg-slate-700/60 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" title="Reject">
                    <XCircle size={18} />
                  </button>
                  <button onClick={() => handleApprove(project.id)} className="p-2 bg-white/60 dark:bg-slate-700/60 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" title="Approve">
                    <CheckCircle size={18} />
                  </button>
                  <button onClick={() => openEditModal(project)} className="p-2 bg-white/60 dark:bg-slate-700/60 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 bg-white/60 dark:bg-slate-700/60 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300" title="Delete">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">End Feedback & Create Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                  <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description / Notes</label>
                  <textarea rows="3" className="input-field" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Designer</label>
                  <select className="input-field" value={formData.assigned_designer_id} onChange={e => setFormData({...formData, assigned_designer_id: e.target.value})}>
                    <option value="">Select Designer...</option>
                    {(Array.isArray(users) ? users : []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select className="input-field" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer p-0 items-center justify-center border-dashed border-2 bg-slate-50 relative" />
                </div>
                <div className="col-span-2 flex items-center gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <input type="checkbox" id="approvecb" className="w-5 h-5 accent-emerald-600 rounded cursor-pointer" checked={formData.approved} onChange={e => setFormData({...formData, approved: e.target.checked})} />
                  <label htmlFor="approvecb" className="text-sm font-semibold text-emerald-800 cursor-pointer">Mark as Approved (Moves directly to Creatives queue)</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
                  {uploading ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Edit Task</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" size={24}/></button>
            </div>
            <form onSubmit={submitEdit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                  <input required type="text" className="input-field" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description / Notes</label>
                  <textarea rows="3" className="input-field" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assign Designer</label>
                  <select className="input-field" value={editFormData.assigned_designer_id} onChange={e => setEditFormData({...editFormData, assigned_designer_id: e.target.value})}>
                    <option value="">Select Designer...</option>
                    {(Array.isArray(users) ? users : []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select className="input-field" value={editFormData.priority} onChange={e => setEditFormData({...editFormData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Add Additional Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer p-0 items-center justify-center border-dashed border-2 bg-slate-50 relative" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="replaceImages" className="w-5 h-5 accent-rose-600 rounded cursor-pointer" checked={editFormData.replaceImages} onChange={e => setEditFormData({...editFormData, replaceImages: e.target.checked})} />
                  <label htmlFor="replaceImages" className="text-sm font-semibold text-rose-800 cursor-pointer">Replace all current images with these new ones</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
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
                Are you absolutely sure you want to completely erase this task? This action cannot be undone.
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

export default Feedback;
