'use client';

import AvatarOrbit from '@/components/AvatarOrbit';
import { motion } from 'framer-motion';
import { useProfile } from '@/components/ProfileProvider';

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

    </main>
  );
}
