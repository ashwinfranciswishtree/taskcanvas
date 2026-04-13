import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import FullscreenViewer from '../components/FullscreenViewer';
import { Search as SearchIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewerImages, setViewerImages] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProjects([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/projects?search=${encodeURIComponent(query)}`);
        setProjects(res.data);
      } catch (err) {
        toast.error('Failed to perform search');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query]);

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Search Results</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            showing results for <span className="text-primary">"{query}"</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium">Searching...</div>
      ) : projects.length === 0 ? (
        <div className="col-span-full py-20 text-center glass-panel">
          <SearchIcon size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium text-lg">No matches found.</p>
          <p className="text-slate-400 mt-2">Try entering different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClickImage={(imgs) => setViewerImages(imgs)}
            />
          ))}
        </div>
      )}

      {viewerImages && (
        <FullscreenViewer images={viewerImages} onClose={() => setViewerImages(null)} />
      )}
    </div>
  );
};

export default SearchResult;
