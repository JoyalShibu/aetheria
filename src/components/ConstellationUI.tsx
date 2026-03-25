'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from './ProfileProvider';
import { Send } from 'lucide-react';

interface ChatBubble {
  id: number;
  user: string;
  color: string;
  message: string;
  x: number;
  y: number;
}

const MOCK_MESSAGES = [
  "This scene is absolutely incredible 🔥",
  "Fahadh Faasil's acting is out of this world!",
  "The cinematography here is peak.",
  "That bgm is giving me goosebumps!!",
  "Wait, did you catch that easter egg?",
  "Anirudh cooked so hard for this BGM.",
  "Such an immersive shot.",
  "Wow the director really nailed the lighting."
];

const MOCK_USERS = [
  { name: "Arjun", color: "#00e5ff" }, 
  { name: "Karthik", color: "#ff3366" }, 
  { name: "Sneha", color: "#9d00ff" }
];

export default function ConstellationUI({ movieTitle }: { movieTitle: string }) {
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const { activeProfile } = useProfile();
  const [draft, setDraft] = useState('');

  useEffect(() => {
    // Spawns a floating chat buble every 4 seconds to simulate an active Watch-Party 
    const interval = setInterval(() => {
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      // Don't mock the current user's profile
      if (activeProfile && randomUser.name === activeProfile.name) return;

      const newBubble: ChatBubble = {
        id: Date.now(),
        user: randomUser.name,
        color: randomUser.color,
        message: MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)],
        // Random spawn coordinates (avoid edges)
        x: Math.floor(Math.random() * 60) + 20, // 20vw to 80vw
        y: Math.floor(Math.random() * 60) + 10, // 10vh to 70vh
      };

      setBubbles((prev) => [...prev.slice(-3), newBubble]); // Keep max 4 visible to avoid clutter
    }, 4000);

    return () => clearInterval(interval);
  }, [activeProfile]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeProfile) return;

    const newBubble: ChatBubble = {
      id: Date.now(),
      user: activeProfile.name,
      color: activeProfile.color,
      message: draft.trim(),
      x: 50, // Spawn own messages near the bottom center initially
      y: 75,
    };

    setBubbles((prev) => [...prev.slice(-3), newBubble]);
    setDraft('');
  };

  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden flex flex-col justify-end">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-12 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full border border-neon-cyan/50 shadow-[0_0_15px_rgba(0,229,255,0.3)] pointer-events-auto"
      >
        <p className="text-xs font-bold tracking-widest uppercase flex items-center gap-2" style={{ color: activeProfile?.color || '#00e5ff' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeProfile?.color || '#00e5ff' }} /> Live Constellation • {movieTitle}
        </p>
      </motion.div>

      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: [0, -10, 10, 0] }}
            exit={{ opacity: 0, scale: 0.8, y: -20, filter: 'blur(10px)' }}
            transition={{ 
              duration: 0.8, 
              x: { duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" } 
            }}
            style={{ left: `${bubble.x}vw`, top: `${bubble.y}vh` }}
            className="absolute glass-panel p-4 rounded-2xl max-w-xs shadow-2xl backdrop-blur-md border-t border-white/10"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: bubble.color }}>
              @{bubble.user}
            </p>
            <p className="text-sm text-white font-medium drop-shadow-md">{bubble.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Chat Input */}
      {activeProfile && (
        <form onSubmit={handleSend} className="pointer-events-auto w-full max-w-md mx-auto mb-12 px-4 relative z-50">
          <div className="relative group">
            <input 
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Transmit your thoughts into the void..."
              className="w-full bg-black/60 border border-white/10 group-hover:border-white/30 focus:border-neon-cyan rounded-full px-6 py-4 text-white font-medium text-sm outline-none transition-all pr-14 backdrop-blur-xl shadow-2xl"
              style={{ paddingLeft: '50px' }}
            />
            {/* Tiny Avatar proxy inside input */}
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-[0_0_10px_currentColor]"
              style={{ backgroundColor: activeProfile.color, color: activeProfile.color }}
            />
            <button 
              type="submit" 
              disabled={!draft.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-neon-cyan hover:text-black rounded-full text-white/50 transition-colors disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:text-white/50"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
