import { fetchDiscoverMovies } from '@/lib/tmdb';
import CarouselUI from '@/components/CarouselUI';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { User } from 'lucide-react';
import { signout } from '@/app/login/actions';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const movies = await fetchDiscoverMovies();

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden min-h-screen">
      <div className="absolute top-8 right-8 z-50">
        {user ? (
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <span className="text-white/70 text-xs font-mono tracking-widest">{user.email?.split('@')[0]}</span>
            <form action={signout}>
              <button className="text-neon-pink hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,100,255,0.2)] transition-all text-white/90 group">
            <User size={16} className="text-neon-pink group-hover:scale-110 transition-transform" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">Sign In</span>
          </Link>
        )}
      </div>

      <CarouselUI movies={movies} />
    </main>
  );
}
