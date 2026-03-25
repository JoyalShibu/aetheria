import { fetchDiscoverMovies } from '@/lib/tmdb';
import CarouselUI from '@/components/CarouselUI';

export default async function Home() {
  // Next.js 15 Server Component: Securely fetches data.
  // In a real scenario, this hides the TMDB API key from the client bundle.
  const movies = await fetchDiscoverMovies();

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden min-h-screen">
      <CarouselUI movies={movies} />
    </main>
  );
}
