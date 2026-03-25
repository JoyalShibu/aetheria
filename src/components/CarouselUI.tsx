'use client';

import { motion } from 'framer-motion';
import FloatingMovieCard from '@/components/FloatingMovieCard';
import { Movie } from '@/lib/tmdb';
import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function CarouselUI({ movies }: { movies: Movie[] }) {
  return (
    <>
      {/* Immersive Title Overlay */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute top-[5%] md:top-[10%] text-center z-50 pointer-events-auto flex flex-col items-center w-full px-4"
      >
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter drop-shadow-2xl select-none">
          AETHERIA
        </h1>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-neon-cyan to-transparent mt-4" />
        
        <div className="flex gap-4 mt-6">
          <Link href="/discovery">
            <button className="px-6 py-2 rounded-full border border-neon-cyan/50 text-neon-cyan text-xs font-bold tracking-[0.2em] uppercase hover:bg-neon-cyan hover:text-black transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              Enter Nebula Matrix
            </button>
          </Link>
          <Link href="/profiles">
            <button className="px-6 py-2 rounded-full border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/10 transition-all">
              Change Frequency
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Orbiting / Floating Carousel */}
      <div className="relative w-full h-full mt-24 md:mt-24 flex items-center z-20" style={{ perspective: '1200px' }}>
        <div 
          className="flex items-center gap-4 md:gap-12 px-8 py-10 md:py-20 w-full overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar" 
          style={{ paddingLeft: 'calc(50vw - 96px)', paddingRight: 'calc(50vw - 96px)', cursor: 'grab' }}
        >
          {movies.map((movie, index) => {
            // Calculate a slight curved offset to simulate an orbit (y-axis wave)
            const offsetDelay = index * 0.1;
            const yOffset = Math.sin(index * 1.5) * 50; 
            
            return (
              <div key={movie.id} className="snap-center shrink-0">
                <FloatingMovieCard 
                  movie={movie} 
                  delay={0.8 + offsetDelay} 
                  yOffset={yOffset}
                  scale={1}
                />
              </div>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
}
