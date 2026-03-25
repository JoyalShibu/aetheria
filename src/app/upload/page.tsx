'use client';

import { addCustomMovie, updateCustomMovie, deleteCustomMovie } from '@/app/actions/movieActions';
import { getAllLiveMoviesForAdmin } from '@/app/actions/tmdbActions';
import Link from 'next/link';
import { ArrowLeft, Plus, UploadCloud, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Movie } from '@/lib/tmdb';

export default function AdminPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Dashboard CMS State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State for Two-Way Binding (needed for Editing mode)
  const [formState, setFormState] = useState({
    title: '', trailerKey: '', director: '', year: '', language: 'ml', synopsis: ''
  });

  const fetchDashboard = () => {
    getAllLiveMoviesForAdmin().then(setMovies);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormState({ title: '', trailerKey: '', director: '', year: '', language: 'ml', synopsis: '' });
  };

  const handleEdit = (movie: Movie) => {
    setEditingId(movie.id);
    setFormState({
      title: movie.title,
      trailerKey: movie.trailerKey || '',
      director: movie.director,
      year: movie.year,
      language: movie.language,
      synopsis: movie.synopsis
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Eradicate ${title} from the master stream?`)) {
      await deleteCustomMovie(id);
      fetchDashboard();
      if (editingId === id) resetForm();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formElement = e.currentTarget;
      const formData = new FormData(formElement);
      const movieFile = formData.get('movieFile') as File | null;
      let finalTrailerKey = formData.get('trailerKey') as string;

      if (movieFile && movieFile.size > 0) {
        // Stream Big Data to API route with Progress Tracking via XHR
        const uploadedPath = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              resolve(data.path);
            } else {
              reject('Video stream upload rejected stringly by server');
            }
          };

          xhr.onerror = () => reject('Fatal Stream Network Error');

          xhr.open('POST', '/api/upload', true);
          xhr.setRequestHeader('X-File-Name', encodeURIComponent(movieFile.name));
          xhr.send(movieFile); // Send raw file straight to stream pipe!
        });
        
        finalTrailerKey = uploadedPath;
      }

      // Inject the securely stored absolute path or YouTube URL back into the payload
      formData.set('trailerKey', finalTrailerKey);
      formData.delete('movieFile'); // IMPORTANT: Strip the massive file blob before Server Action execution
      
      if (editingId) {
        formData.set('id', editingId);
        await updateCustomMovie(formData);
      } else {
        await addCustomMovie(formData);
      }

      resetForm();
      fetchDashboard();
      setIsUploading(false);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <main className="relative min-h-screen text-foreground p-8 overflow-y-auto">
      <div className="fixed inset-0 bg-gradient-to-b from-void-deep/80 to-black z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto pt-16 pb-32">
        <div className="flex items-center justify-between mb-12">
          <Link href="/">
            <div className="inline-flex items-center gap-2 text-white/50 hover:text-neon-cyan transition-colors cursor-pointer glass-panel px-4 py-2 rounded-full">
              <ArrowLeft size={16} />
              <span className="uppercase tracking-widest font-bold text-xs">Return to Orbit</span>
            </div>
          </Link>
          {editingId && (
            <button onClick={resetForm} className="inline-flex items-center gap-2 text-bright-coral hover:text-white transition-colors cursor-pointer glass-panel px-4 py-2 rounded-full border border-bright-coral/20">
              <RotateCcw size={16} />
              <span className="uppercase tracking-widest font-bold text-xs">Cancel Edit</span>
            </button>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neon-cyan tracking-tighter mb-4 drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
          AETHERIA COMMAND
        </h1>
        <p className="text-gray-400 font-medium mb-12 tracking-widest uppercase text-xs border-l-2 border-neon-cyan pl-4">
          Inject or modify Custom Cinema directly into the master stream.
        </p>

        {/* CMS Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-12 rounded-3xl flex flex-col gap-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-2xl mb-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-[0.2em]">Movie Title</label>
              <input name="title" value={formState.title} onChange={handleChange} required className="bg-black/50 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-inner" placeholder="e.g. In Harihar Nagar" />
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-[0.2em]">Media Source (Choose One)</label>
              <div className="flex flex-col md:flex-row gap-4">
                <input name="trailerKey" value={formState.trailerKey} onChange={handleChange} className="flex-1 bg-black/50 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-inner" placeholder="YouTube ID or relative upload path" />
                <span className="text-white/30 flex items-center justify-center font-bold tracking-widest uppercase text-xs">OR</span>
                <input type="file" name="movieFile" accept="video/mp4,video/webm" className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:tracking-widest file:uppercase file:bg-neon-cyan file:text-black hover:file:bg-white transition-all shadow-inner" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-[0.2em]">Director</label>
              <input name="director" value={formState.director} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-inner" placeholder="e.g. Siddique-Lal" />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-[0.2em]">Release Year</label>
              <input name="year" value={formState.year} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-inner" placeholder="e.g. 1990" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
              <label className="text-neon-cyan text-xs font-bold uppercase tracking-[0.2em]">Language</label>
              <select name="language" value={formState.language} onChange={handleChange} className="bg-black/50 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-neon-cyan transition-all appearance-none">
                <option value="ml">Malayalam</option>
                <option value="ta">Tamil</option>
              </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-neon-cyan text-xs font-bold uppercase tracking-[0.2em]">Synopsis</label>
            <textarea name="synopsis" value={formState.synopsis} onChange={handleChange} rows={4} className="bg-black/50 border border-white/10 rounded-xl p-4 text-white font-medium focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all resize-none shadow-inner" placeholder="A brief description of the movie..." />
          </div>
          
          {/* Neon Upload Progress Bar */}
          {isUploading && (
             <div className="w-full bg-black/60 rounded-full h-2.5 mt-4 overflow-hidden border border-neon-cyan/30">
                <div className="bg-neon-cyan h-2.5 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_#00e5ff]" style={{ width: `${progress}%` }}></div>
                <p className="text-center text-xs mt-2 text-neon-cyan font-bold tracking-widest uppercase">{progress}% Transported</p>
             </div>
          )}

          <button disabled={isUploading} type="submit" className="mt-2 flex items-center justify-center gap-3 bg-neon-cyan hover:bg-white text-black font-black uppercase tracking-[0.3em] py-5 rounded-2xl transition-all duration-500 shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-neon-cyan">
            {isUploading ? <UploadCloud className="animate-pulse" size={22} /> : (editingId ? <Edit3 strokeWidth={3} size={22} /> : <Plus strokeWidth={3} size={22} />)}
            {isUploading ? 'Streaming to Core...' : (editingId ? 'Update Movie Config' : 'Inject into Stream')}
          </button>
        </form>

        {/* Existing Custom Movies Grid */}
        <div className="mt-20">
          <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-8 border-b border-white/10 pb-4">
            Active Stream <span className="text-neon-cyan">Manifest</span>
          </h2>
          
          {movies.length === 0 ? (
            <p className="text-white/30 text-center font-mono py-12">No custom transmissions detected.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {movies.map((movie) => (
                 <div key={movie.id} className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-neon-cyan/50 transition-colors group flex flex-col h-full bg-black/40 relative overflow-hidden">
                   
                   {/* Background Tint */}
                   <div 
                     className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity z-0 bg-cover bg-center"
                     style={{ backgroundImage: `url(${movie.poster})` }}
                   />

                   <div className="relative z-10 flex flex-col h-full">
                     <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{movie.title}</h3>
                     <p className="text-xs text-neon-cyan uppercase tracking-widest font-bold mb-4">{movie.year} • {movie.director}</p>
                     
                     <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                        <span className="text-[10px] text-white/40 tracking-wider blur-[1px] group-hover:blur-0 transition-all font-mono truncate max-w-[120px]">{movie.id}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.preventDefault(); handleEdit(movie); }}
                            className="p-2 bg-white/10 hover:bg-neon-cyan rounded-lg text-white hover:text-black transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.preventDefault(); handleDelete(movie.id, movie.title); }}
                            className="px-3 py-2 flex items-center gap-2 bg-bright-coral/10 hover:bg-bright-coral rounded-lg text-bright-coral hover:text-white border border-bright-coral/20 transition-all shadow-[0_0_10px_rgba(255,82,82,0.1)] group-hover:shadow-[0_0_15px_rgba(255,82,82,0.3)]"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                            <span className="text-xs uppercase font-bold tracking-widest hidden md:block">Eradicate</span>
                          </button>
                        </div>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
