'use server';

import { Movie } from '@/lib/tmdb';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

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
  
  if (!poster) poster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400';
  if (!backdrop) backdrop = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200';
  
  return { poster, backdrop, fallbackSynopsis, fallbackYear };
}

export async function addCustomMovie(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const title = formData.get('title') as string || 'Untitled';
    const { poster, backdrop, fallbackSynopsis, fallbackYear } = await hydrateFromTMDB(null, title);

    const newMovie = {
      id: 'custom_' + Date.now().toString(),
      title: title,
      poster: poster,
      backdrop: backdrop,
      director: formData.get('director') as string || 'Unknown',
      year: formData.get('year') as string || fallbackYear || 'N/A',
      synopsis: formData.get('synopsis') as string || fallbackSynopsis || 'No synopsis provided.',
      language: formData.get('language') as string || 'ml',
      trailerKey: formData.get('trailerKey') as string || '',
      user_id: user?.id || null 
    };

    const { error } = await supabase.from('movies').insert(newMovie);
    if (error) throw error;

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to add custom movie:", error);
    return { success: false };
  }
}

export async function getCustomMovies(): Promise<Movie[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase.from('movies').select('*');
    
    if (user) {
      // Show global movies (user_id is null) AND user's personal movies
      query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
    } else {
      // Show only global movies
      query = query.is('user_id', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error || !data) return [];
    
    // Map DB rows to Movie interface format
    return data.map(row => ({
      id: row.id,
      title: row.title,
      poster: row.poster,
      backdrop: row.backdrop,
      director: row.director,
      year: row.year,
      synopsis: row.synopsis,
      language: row.language,
      trailerKey: row.trailerKey,
      cast: [] // Mocked for custom videos
    }));
  } catch {
    return [];
  }
}

export async function getHiddenMovieIds(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('hidden_movies').select('movie_id');
    if (error || !data) return [];
    return data.map(row => row.movie_id);
  } catch {
    return [];
  }
}

export async function deleteCustomMovie(id: string) {
  try {
    const supabase = await createClient();
    
    // Attempt to delete from custom movies
    const { error } = await supabase.from('movies').delete().eq('id', id);
    
    if (error) {
      // If it wasn't a custom movie, it might be a global TMDB movie that needs hiding
      const { error: hiddenError } = await supabase.from('hidden_movies').insert([{ movie_id: id }]);
      if (hiddenError) throw hiddenError;
    }
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete/hide movie:", error);
    return { success: false };
  }
}

export async function updateCustomMovie(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { success: false, error: 'No ID provided' };

    const supabase = await createClient();
    const { data: existingMovie } = await supabase.from('movies').select('*').eq('id', id).single();
    
    if (!existingMovie) {
      // Not in DB -> it's a TMDB movie override
      const title = (formData.get('title') as string) || 'Untitled';
      const { poster, backdrop, fallbackSynopsis, fallbackYear } = await hydrateFromTMDB(id, title);

      const overrideMovie = {
        id: id,
        title: title,
        poster: poster,
        backdrop: backdrop,
        director: (formData.get('director') as string) || 'Unknown',
        year: (formData.get('year') as string) || fallbackYear || 'N/A',
        synopsis: (formData.get('synopsis') as string) || fallbackSynopsis || '',
        language: (formData.get('language') as string) || 'ml',
        trailerKey: (formData.get('trailerKey') as string) || ''
      };
      await supabase.from('movies').insert(overrideMovie);
    } else {
      // Update existing
      const updates: any = {};
      const title = formData.get('title') as string;
      if (title) updates.title = title;
      
      const { poster, backdrop } = await hydrateFromTMDB(null, title || existingMovie.title);
      if (poster && !poster.includes('unsplash')) updates.poster = poster;
      if (backdrop && !backdrop.includes('unsplash')) updates.backdrop = backdrop;
      
      Array.from(['director', 'year', 'synopsis', 'language', 'trailerKey']).forEach(key => {
        const val = formData.get(key) as string;
        if (val) updates[key] = val;
      });

      await supabase.from('movies').update(updates).eq('id', id);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to update custom movie:", error);
    return { success: false };
  }
}
