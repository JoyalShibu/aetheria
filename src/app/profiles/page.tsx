'use client';

import AvatarOrbit from '@/components/AvatarOrbit';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/components/ProfileProvider';
import Link from 'next/link';
import { User, ArrowRight } from 'lucide-react';

export default function ProfilesPage() {
  const { activeProfile } = useProfile();

  return (
    <main className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Background Deep Gradient Override */}
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
        className="w-full relative z-10 flex-1 flex items-center justify-center"
      >
        <AvatarOrbit />
      </motion.div>

      <AnimatePresence>
        {activeProfile && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-12 left-0 right-0 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 z-50 pointer-events-auto"
          >
            <Link href="/">
              <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 hover:border-white/40 shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all text-white/90 group">
                <span className="text-sm uppercase tracking-[0.2em] font-bold">Enter Matrix</span>
                <ArrowRight size={18} className="text-neon-cyan group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link href="/login">
              <button 
                className="flex items-center gap-3 bg-neon-pink/20 hover:bg-neon-pink/40 backdrop-blur-md px-8 py-4 rounded-full border border-neon-pink/50 shadow-[0_0_20px_rgba(255,100,255,0.3)] hover:shadow-[0_0_30px_rgba(255,100,255,0.6)] transition-all text-white group"
                style={{ borderColor: activeProfile.color, boxShadow: `0 0 20px ${activeProfile.color}40` }}
              >
                <User size={18} className="text-white group-hover:scale-110 transition-transform" />
                <span className="text-sm uppercase tracking-[0.2em] font-bold">Sign In</span>
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
