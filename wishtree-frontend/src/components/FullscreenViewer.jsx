import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const FullscreenViewer = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleDownload = () => {
<<<<<<< HEAD
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const imageUrl = `${API_BASE_URL}${images[currentIndex]}`;
=======
    const imageUrl = `http://localhost:5000${images[currentIndex]}`;
>>>>>>> dd6b6519e8604450fac8d6c50f5ecf5a09f4070a
    const fileName = images[currentIndex].split('/').pop();
    
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
      });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (!images || images.length === 0) return null;

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 right-6 flex gap-3">
        <button 
          onClick={handleDownload}
          className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
          title="Download Image"
        >
          <Download size={28} />
        </button>
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
          title="Close"
        >
          <X size={28} />
        </button>
      </div>

      <div className="relative w-full max-w-6xl max-h-[85vh] flex items-center justify-center group">
        <img 
<<<<<<< HEAD
          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${images[currentIndex]}`} 
=======
          src={`http://localhost:5000${images[currentIndex]}`} 
>>>>>>> dd6b6519e8604450fac8d6c50f5ecf5a09f4070a
          alt="Preview Gallery" 
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform"
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all border border-white/10"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all border border-white/10"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2 overflow-x-auto max-w-full px-4 pb-2">
          {images.map((img, idx) => (
            <img 
              key={idx}
<<<<<<< HEAD
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`}
=======
              src={`http://localhost:5000${img}`}
>>>>>>> dd6b6519e8604450fac8d6c50f5ecf5a09f4070a
              alt={`Thumbnail ${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`h-16 w-16 object-cover rounded-md cursor-pointer transition-all border-2 ${idx === currentIndex ? 'border-primary shadow-lg scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FullscreenViewer;
