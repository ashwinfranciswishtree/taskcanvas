import React, { useState } from 'react';
import { Calendar, User, Clock, Image as ImageIcon, Download } from 'lucide-react';
import { format } from 'date-fns';

const ProjectCard = ({ project, actions, onClickImage }) => {

  const handleDownloadMainImage = (e) => {
    e.stopPropagation();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const imageUrl = `${API_BASE_URL}${project.images[0]}`;
    const fileName = project.images[0].split('/').pop();
    
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => window.open(imageUrl, '_blank'));
  };

  return (
    <div className={`glass-panel p-6 hover:shadow-xl transition-all duration-300 border-l-4 flex flex-col group relative ${project.is_rejected ? 'border-l-rose-500 bg-rose-50/10 dark:bg-rose-900/10' : 'border-l-primary'}`}>
      <div className="absolute top-3 right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 transform scale-95 md:scale-90 group-hover:scale-100">
        {actions}
      </div>

      <div className="flex justify-between items-start mb-4 pr-16 md:pr-0 group-hover:pr-16 transition-all duration-300">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2 flex-wrap">
            {project.name}
            {project.is_rejected ? <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-800">Rejected</span> : null}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{project.description || 'No description provided.'}</p>
        </div>
      </div>
      
      {Array.isArray(project.images) && project.images.length > 0 && (
        <div className="mb-5 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm p-2 rounded-xl border border-slate-100/50 dark:border-slate-700/50">
          <div 
            className="h-40 w-full rounded-lg bg-cover bg-center cursor-pointer shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group/img"
            style={{ backgroundImage: `url("${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${encodeURI(project.images[0])}")` }}
            onClick={() => onClickImage(project.images)}
          >
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center gap-4">
              <ImageIcon className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md" size={32} />
              <button 
                onClick={handleDownloadMainImage}
                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md border border-white/30 opacity-0 group-hover/img:opacity-100 transition-opacity"
                title="Download Main Image"
              >
                <Download size={20} />
              </button>
            </div>
            {project.images.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm font-medium">
                +{project.images.length - 1}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-slate-100/50 dark:border-slate-700/50 grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-600 dark:text-slate-400 font-medium z-0 relative">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50">
            <User size={12} />
          </div>
          <span className="truncate">{project.assigned_designer_name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
            <Clock size={12} />
          </div>
          <span>{project.priority || 'Medium'}</span>
        </div>
        {project.created_at && (
          <div className="col-span-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
               <Calendar size={12} />
            </div>
            <span>Created {format(new Date(project.created_at), 'MMM dd, yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
