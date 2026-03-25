import { getMovieById } from '@/lib/tmdb';
import MovieDiorama from '@/components/MovieDiorama';
import { notFound } from 'next/navigation';

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovieById(id);

  if (!movie) {
    notFound();
  }

  return <MovieDiorama movie={movie} />;
}
