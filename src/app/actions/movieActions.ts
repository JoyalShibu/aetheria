'use server';

import fs from 'fs/promises';
import path from 'path';
import { Movie } from '@/lib/tmdb';
import { revalidatePath } from 'next/cache';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const dataFilePath = path.join(process.cwd(), 'data', 'custom_movies.json');

async function hydrateFromTMDB(id: string | null, title: string) {
  const apiKey = process.env.TMDB_API_KEY;
  let poster = '';
  let backdrop = '';
  let fallbackSynopsis = '';
  let fallbackYear = '';

  if (apiKey) {
    let match: any = null;
    if (id && !id.startsWith('custom_')) {
      const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${apiKey}`).catch(() => null);
      if (res?.ok) match = await res.json();
    }
    
    if (!match && title) {
      const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(title)}&api_key=${apiKey}`).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) match = data.results[0];
      }
    }

    if (match) {
      poster = match.poster_path ? `${TMDB_IMAGE_BASE_URL}${match.poster_path}` : '';
      backdrop = match.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${match.backdrop_path}` : '';
      fallbackSynopsis = match.overview || '';
      fallbackYear = match.release_date ? match.release_date.substring(0, 4) : '';
    }
  }
  
  // Fallbacks if absolutely nothing found
  if (!poster) poster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400';
  if (!backdrop) backdrop = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200';
  
  return { poster, backdrop, fallbackSynopsis, fallbackYear };
}

export async function addCustomMovie(formData: FormData) {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8').catch(() => '[]');
    let movies: Movie[] = [];
    try {
      movies = JSON.parse(fileContent);
    } catch {
      movies = [];
    }

    const title = formData.get('title') as string || 'Untitled';
    const { poster, backdrop, fallbackSynopsis, fallbackYear } = await hydrateFromTMDB(null, title);

    const newMovie: Movie = {
      id: 'custom_' + Date.now().toString(),
      title: title,
      poster: poster,
      backdrop: backdrop,
      director: formData.get('director') as string || 'Unknown',
      year: formData.get('year') as string || fallbackYear || 'N/A',
      synopsis: formData.get('synopsis') as string || fallbackSynopsis || 'No synopsis provided.',
      language: formData.get('language') as string || 'ml',
      cast: [],
      trailerKey: formData.get('trailerKey') as string || ''
    };

    movies.unshift(newMovie); // Add to the absolute front
    
    await fs.writeFile(dataFilePath, JSON.stringify(movies, null, 2));

    // Instantly invalidate the home page cache so the orbit updates automatically without a hard refresh
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error("Failed to add custom movie:", error);
    return { success: false };
  }
}

export async function getCustomMovies(): Promise<Movie[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8').catch(() => '[]');
    return JSON.parse(fileContent);
  } catch {
    return [];
  }
}

export async function getHiddenMovieIds(): Promise<string[]> {
  try {
    const hiddenFilePath = path.join(process.cwd(), 'data', 'hidden_movies.json');
    const fileContent = await fs.readFile(hiddenFilePath, 'utf-8').catch(() => '[]');
    return JSON.parse(fileContent);
  } catch {
    return [];
  }
}

export async function deleteCustomMovie(id: string) {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8').catch(() => '[]');
    let movies: Movie[] = JSON.parse(fileContent);
    
    const movieToDelete = movies.find(m => m.id === id);
    if (movieToDelete) {
      if (movieToDelete.trailerKey?.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', movieToDelete.trailerKey);
        try {
          await fs.unlink(filePath);
          console.log(`Physically deleted movie file: ${filePath}`);
        } catch (e) {
          console.error(`Failed to physically delete file ${filePath}:`, e);
        }
      }

      movies = movies.filter(m => m.id !== id);
      await fs.writeFile(dataFilePath, JSON.stringify(movies, null, 2));
    } else {
      // It's a Global TMDB / Mock movie. Hide it.
      const hiddenFilePath = path.join(process.cwd(), 'data', 'hidden_movies.json');
      const hiddenContent = await fs.readFile(hiddenFilePath, 'utf-8').catch(() => '[]');
      let hidden: string[] = JSON.parse(hiddenContent);
      if (!hidden.includes(id)) {
        hidden.push(id);
        await fs.writeFile(hiddenFilePath, JSON.stringify(hidden, null, 2));
      }
    }
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete movie:", error);
    return { success: false };
  }
}

export async function updateCustomMovie(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { success: false, error: 'No ID provided' };

    const fileContent = await fs.readFile(dataFilePath, 'utf-8').catch(() => '[]');
    let movies: Movie[] = JSON.parse(fileContent);
    const movieIndex = movies.findIndex(m => m.id === id);
    
    if (movieIndex === -1) {
      // The user is editing a Global / TMDB movie. Create a JSON override clone!
      const title = (formData.get('title') as string) || 'Untitled';
      const { poster, backdrop, fallbackSynopsis, fallbackYear } = await hydrateFromTMDB(id, title);

      const overrideMovie: Movie = {
        id: id,
        title: title,
        poster: poster,
        backdrop: backdrop,
        director: (formData.get('director') as string) || 'Unknown',
        year: (formData.get('year') as string) || fallbackYear || 'N/A',
        synopsis: (formData.get('synopsis') as string) || fallbackSynopsis || '',
        language: (formData.get('language') as string) || 'ml',
        cast: [], // Simplification for overrides,
        trailerKey: (formData.get('trailerKey') as string) || ''
      };
      movies.unshift(overrideMovie);
    } else {
      // Update existing custom movie fields conditionally
      const title = formData.get('title') as string;
      if (title) movies[movieIndex].title = title;
      
      const { poster, backdrop } = await hydrateFromTMDB(null, title || movies[movieIndex].title);
      if (poster && !poster.includes('unsplash')) movies[movieIndex].poster = poster;
      if (backdrop && !backdrop.includes('unsplash')) movies[movieIndex].backdrop = backdrop;
      
      const director = formData.get('director') as string;
      if (director) movies[movieIndex].director = director;
      
      const year = formData.get('year') as string;
      if (year) movies[movieIndex].year = year;
      
      const synopsis = formData.get('synopsis') as string;
      if (synopsis) movies[movieIndex].synopsis = synopsis;
      
      const language = formData.get('language') as string;
      if (language) movies[movieIndex].language = language;

      let finalTrailerKey = formData.get('trailerKey') as string;
      if (finalTrailerKey) movies[movieIndex].trailerKey = finalTrailerKey;
    }

    await fs.writeFile(dataFilePath, JSON.stringify(movies, null, 2));
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update custom movie:", error);
    return { success: false };
  }
}
