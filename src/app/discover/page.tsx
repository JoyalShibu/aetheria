import CanvasBackground from '@/components/CanvasBackground';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function DiscoveryPage() {
  return (
    <main className="relative min-h-screen text-foreground overflow-hidden flex flex-col items-center justify-center">
      <CanvasBackground />
      
      <div className="absolute top-8 left-8 z-50 pointer-events-auto">
        <Link href="/">
          <div className="flex items-center gap-2 text-white/50 hover:text-neon-cyan transition-all bg-black/40 px-4 py-2 rounded-full glass-panel cursor-pointer">
            <ArrowLeft size={16} />
            <span className="text-xs uppercase tracking-widest font-bold">Return to Orbit</span>
          </div>
        </Link>
      </div>

      <div className="z-10 text-center mb-16 px-4">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white tracking-tighter drop-shadow-2xl">
          THE NEBULA
        </h1>
        <p className="text-neon-cyan/80 mt-4 tracking-[0.3em] text-xs font-semibold uppercase drop-shadow-md">
          Explore the Constellations of Cinema
        </p>
      </div>

      <div className="relative w-full max-w-4xl z-20 px-8">
        <div className="glass-panel rounded-full flex items-center px-6 py-4 border border-white/20 shadow-[0_0_30px_rgba(0,229,255,0.1)] focus-within:shadow-[0_0_50px_rgba(0,229,255,0.3)] focus-within:border-neon-cyan transition-all">
          <Search className="text-neon-cyan mr-4" size={24} />
          <input 
            type="text" 
            placeholder="Search directors, actors, genres..." 
            className="bg-transparent border-none outline-none w-full text-white placeholder-white/30 font-medium text-lg"
          />
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center z-10 mt-12">
        <p className="text-white/40 font-light tracking-widest text-sm uppercase">3D Node Graph Connecting...</p>
      </div>

    </main>
  );
}
