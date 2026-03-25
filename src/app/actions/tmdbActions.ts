'use server';

import { fetchDiscoverMovies } from '@/lib/tmdb';

// Server Action wrapper so Admin CMS can call this from Client component cleanly
export async function getAllLiveMoviesForAdmin() {
  return await fetchDiscoverMovies();
}
