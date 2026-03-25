'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Movie } from '@/lib/tmdb';
import Link from 'next/link';

export default function FloatingMovieCard({ movie, delay = 0, yOffset = 0, scale = 1 }: { movie: Movie, delay?: number, yOffset?: number, scale?: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/movie/${movie.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: yOffset + 50 }}
        animate={{ opacity: 1, scale: scale, y: yOffset }}
        transition={{ duration: 0.8, delay, type: 'spring' }}
        whileHover={{ scale: scale * 1.05, zIndex: 50 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-48 h-[270px] md:w-56 md:h-80 rounded-2xl overflow-hidden glass-panel cursor-pointer group will-change-transform block"
        style={{ perspective: 1000 }}
      >
        <motion.div 
          layoutId={`movie-poster-${movie.id}`} // Ties correctly with the Diorama transition
          className="w-full h-full relative"
          animate={{ 
            rotateX: isHovered ? 5 : 0, 
            rotateY: isHovered ? -5 : 0,
            y: isHovered ? -10 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10" />
          
          <div className="absolute inset-0 bg-void-deep/80 flex items-center justify-center text-nebula-teal overflow-hidden">
             <div className="w-full h-full opacity-60 bg-center bg-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100" style={{ backgroundImage: `url('${movie.poster}')`}}/>
          </div>

          <div className="absolute bottom-0 left-0 p-4 md:p-5 z-20 transform transition-transform duration-300">
            <motion.h3 layoutId={`movie-title-${movie.id}`} className="text-white font-black text-lg md:text-xl leading-tight tracking-wide group-hover:text-neon-cyan transition-colors drop-shadow-md">
              {movie.title}
            </motion.h3>
            <p className="text-gray-300 text-xs md:text-sm mt-1 font-medium tracking-wider">{movie.year} • {movie.director}</p>
          </div>
          
          <motion.div 
            className="absolute inset-0 rounded-2xl pointer-events-none border border-white/10"
            animate={{ boxShadow: isHovered ? '0 0 25px 2px rgba(0, 229, 255, 0.4)' : '0 0 0px 0px rgba(0,0,0,0)' }}
          />
        </motion.div>
      </motion.div>
    </Link>
  );
}
