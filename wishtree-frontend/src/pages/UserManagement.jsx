import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserPlus, Edit2, Trash2, Shield, User, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    role: 'Designer',
    designation: '',
    password: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/users/${formData.id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setFormData({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User deleted');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  const openNewModal = () => {
    setFormData({ id: null, name: '', email: '', role: 'Designer', designation: '', password: '' });
    setIsModalOpen(true);
  };

  return (
    <div>
       <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage team members and roles</p>
        </div>
        <button 
          onClick={openNewModal}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={20} />
          Add New User
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Access</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <Briefcase size={16} className="text-slate-400" />
                      {user.designation || '-'}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                     <div className="flex justify-end gap-2">
                       <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={18}/></button>
                       <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">{formData.id ? 'Edit User' : 'Create New User'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input required type="text" className="input-field pl-10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role (Access Level)</label>
                 <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="Designer">Designer</option>
                    <option value="Manager">Manager</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Admin">Admin</option>
                 </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Designation (Job Title)</label>
                <input type="text" className="input-field" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{formData.id ? 'Password (leave blank to keep current)' : 'Password'}</label>
                <input type="password" required={!formData.id} className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Update User' : 'Save User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
