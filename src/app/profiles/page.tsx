'use client';

import AvatarOrbit from '@/components/AvatarOrbit';
import { motion } from 'framer-motion';
import { useProfile } from '@/components/ProfileProvider';
import { useState } from 'react';
import { addProfile } from './actions';

export default function ProfilesPage() {
  const { activeProfile, profiles } = useProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    
    // Pick a random cool color
    const colors = ['#00e5ff', '#ff3366', '#9d00ff', '#00ff66', '#ffaa00'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('color', color);
    
    const result = await addProfile(formData);
    if (result.success) {
      setIsCreating(false);
      setName('');
      // Force a reload to have ProfileProvider re-fetch
      window.location.reload(); 
    } else {
      alert(result.error || 'Failed to create profile');
    }
    setIsSubmitting(false);
  };

  const hasNoProfiles = profiles && profiles.length === 0;

  return (
    <main className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-void-deep/50 via-black to-black z-0 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 text-center mt-12 mb-8 pointer-events-none"
      >
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-[0.2em] uppercase drop-shadow-2xl">
          Who is Watching?
        </h1>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-neon-cyan to-transparent mx-auto mt-6" />
        <p className="text-neon-cyan mt-6 tracking-[0.4em] text-xs font-bold uppercase drop-shadow-md">
          {activeProfile ? `Selected: ${activeProfile.name}` : `Select Your Frequency`}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="w-full relative z-10 flex-1 flex flex-col items-center justify-center"
      >
        {hasNoProfiles && !isCreating ? (
          <div className="text-center">
            <h2 className="text-white text-xl mb-6 tracking-widest uppercase">No Profiles Found</h2>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-neon-cyan text-black px-8 py-3 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              Initialize Feed
            </button>
          </div>
        ) : isCreating ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4 w-full max-w-sm bg-black/50 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
            <h2 className="text-white text-center font-bold tracking-[0.2em] uppercase">New Persona</h2>
            <input 
              type="text" 
              placeholder="Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border border-white/20 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all uppercase tracking-widest text-sm text-center"
              required
              autoFocus
            />
            <button 
              disabled={isSubmitting}
              type="submit" 
              className="mt-4 bg-neon-pink text-white px-8 py-3 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors shadow-[0_0_20px_rgba(255,100,255,0.4)] disabled:opacity-50"
            >
              {isSubmitting ? 'Validating...' : 'Acknowledge'}
            </button>
            {!hasNoProfiles && (
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="text-white/50 text-xs uppercase tracking-widest hover:text-white transition-colors mt-2"
              >
                Cancel
              </button>
            )}
          </form>
        ) : (
          <AvatarOrbit />
        )}
      </motion.div>
      
      {!hasNoProfiles && !isCreating && (
        <button 
          onClick={() => setIsCreating(true)}
          className="absolute bottom-12 text-white/40 hover:text-white text-xs tracking-widest uppercase font-bold transition-colors z-50 px-6 py-2 rounded-full border border-white/10 hover:border-white/30 backdrop-blur-md"
        >
          Add Profile
        </button>
      )}

    </main>
  );
}
