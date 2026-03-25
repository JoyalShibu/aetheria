import { fetchDiscoverMovies } from '@/lib/tmdb';
import NebulaGraph from '@/components/NebulaGraph';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';

export default async function DiscoveryPage() {
  const movies = await fetchDiscoverMovies();

  return (
    <main className="relative min-h-screen text-foreground pt-0 overflow-hidden flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-void-deep via-black to-black z-0 pointer-events-none" />

      {/* Top Nav */}
      <header className="relative z-50 w-full p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/">
          <div className="inline-flex items-center gap-2 text-white/50 hover:text-neon-cyan transition-colors cursor-pointer glass-panel px-4 py-2 rounded-full border border-white/5 shadow-lg backdrop-blur-md">
            <ArrowLeft size={16} />
            <span className="uppercase tracking-widest font-bold text-xs">Return to Orbit</span>
          </div>
        </Link>

        {/* This will be replaced by the Profile Avatar Nav logic later, just a placeholder for now */}
        <Link href="/profiles">
          <div className="inline-flex items-center gap-2 text-white/50 hover:text-bright-coral transition-colors cursor-pointer glass-panel px-4 py-2 rounded-full border border-white/5 shadow-lg backdrop-blur-md">
            <User size={16} />
            <span className="uppercase tracking-widest font-bold text-xs">Switch Frequency</span>
          </div>
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-10">
        <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 tracking-[0.5em] uppercase text-center w-full drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] select-none">
          Discovery Node
        </h1>
        
        <div className="w-full flex-1">
          <NebulaGraph movies={movies} />
        </div>
      </div>
    </main>
  );
}
