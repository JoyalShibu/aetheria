'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/lib/tmdb';
import Link from 'next/link';

interface NebulaGraphProps {
  movies: Movie[];
}

export default function NebulaGraph({ movies }: NebulaGraphProps) {
  const [query, setQuery] = useState('');
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Filter movies
  const filtered = useMemo(() => {
    if (!query) return movies;
    const lower = query.toLowerCase();
    return movies.filter(
      m => m.title.toLowerCase().includes(lower) || 
           (m.director && m.director.toLowerCase().includes(lower)) ||
           m.language.toLowerCase().includes(lower)
    );
  }, [movies, query]);

  // Generate pseudo-random positions for nodes in a 2.5D space layout
  const nodes = useMemo(() => {
    return filtered.map((movie, index) => {
      // Golden angle distribution for node graph
      const radius = 150 + Math.sqrt(index) * 80;
      const angle = index * 137.5 * (Math.PI / 180);
      
      const baseX = Math.cos(angle) * radius;
      const baseY = Math.sin(angle) * radius;
      
      return {
        ...movie,
        x: baseX,
        y: baseY,
      };
    });
  }, [filtered]);

  return (
    <div className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden perspective-[1200px]">
      
      {/* Central Core (Search Hub) */}
      <div className="absolute z-50 top-10 w-full max-w-lg px-8">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search titles, directors, timelines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-black/60 border border-void-deep focus:border-neon-cyan/80 rounded-full px-8 py-5 text-white font-medium tracking-widest uppercase text-xs outline-none transition-all shadow-[0_0_20px_rgba(0,0,0,0.8)] focus:shadow-[0_0_40px_rgba(0,229,255,0.2)]"
          />
          <div className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
        </div>
      </div>

      {/* Nebula Graph Canvas */}
      <div className="relative w-full h-full transform-style-3d">
        <AnimatePresence>
          {nodes.map((node) => {
            const isHovered = activeNode === node.id;
            
            return (
              <motion.div
                key={node.id}
                layoutId={`nebula-node-${node.id}`}
                initial={{ opacity: 0, scale: 0, z: -500 }}
                animate={{ 
                  opacity: 1, 
                  scale: isHovered ? 1.4 : 1, 
                  x: node.x, 
                  y: node.y,
                  z: isHovered ? 100 : (query ? 0 : Math.sin(node.x) * 100),
                  filter: activeNode && !isHovered ? 'blur(8px) brightness(0.3)' : 'blur(0px) brightness(1)'
                }}
                exit={{ opacity: 0, scale: 0, z: -1000 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="absolute left-1/2 top-1/2 -ml-16 -mt-24 w-32 h-48 cursor-pointer group"
                onHoverStart={() => setActiveNode(node.id)}
                onHoverEnd={() => setActiveNode(null)}
              >
                <Link href={`/movie/${node.id}`}>
                  <div className="relative w-full h-full rounded-xl overflow-hidden glass-panel border border-white/10 group-hover:border-neon-cyan transition-colors">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundImage: `url(${node.poster})` }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <p className="text-white font-bold text-xs uppercase tracking-wider drop-shadow-md truncate">{node.title}</p>
                      <p className="text-neon-cyan text-[9px] uppercase tracking-widest font-black mt-1 truncate">{node.director}</p>
                    </div>
                  </div>
                  
                  {/* Cosmic Web Connections (Pseudo lines pointing to center) */}
                  <div className="absolute top-1/2 left-1/2 w-[2px] bg-gradient-to-t from-neon-cyan/0 to-neon-cyan/20 origin-top h-[150px] -z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity mix-blend-screen"
                    style={{ transform: `rotate(${-Math.atan2(node.x, node.y)}rad)` }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
