const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
import { getCustomMovies, getHiddenMovieIds } from '@/app/actions/movieActions';

export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  director: string;
  year: string;
  synopsis: string;
  language: 'ml' | 'ta' | string;
  cast: { name: string; character: string; image: string }[];
  trailerKey?: string;
}

const AADU_2_CUSTOM: Movie = {
  id: 'custom_aadu_2',
  title: 'Aadu 2',
  poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400',
  backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200',
  director: 'Midhun Manuel Thomas',
  year: '2017',
  synopsis: 'Shaji Pappan and his gang are back, and this time they are up against a whole new set of hilarious troubles.',
  language: 'ml',
  cast: [{ name: 'Jayasurya', character: 'Shaji Pappan', image: '' }],
  trailerKey: 'ibw3-fIrgbY'
};

const mockMovies: Movie[] = [
  AADU_2_CUSTOM,
  {
    id: '41253',
    title: 'Manichitrathazhu',
    poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=400',
    backdrop: 'https://images.unsplash.com/photo-1444124818704-4d89a495bbae?q=80&w=1200',
    director: 'Fazil',
    year: '1993',
    synopsis: 'When a couple moves into a haunted ancestral home, unnatural events unfold.',
    language: 'ml',
    cast: [{ name: 'Mohanlal', character: 'Dr. Sunny', image: '' }]
  }
];

export async function fetchDiscoverMovies(): Promise<Movie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  const customOverrides = await getCustomMovies();
  const hiddenIds = await getHiddenMovieIds();
  
  const customIds = customOverrides.map(m => m.id);
  const deduplicatedMocks = mockMovies.filter(m => !customIds.includes(m.id));
  
  if (!apiKey) {
    return [...customOverrides, ...deduplicatedMocks].filter(m => !hiddenIds.includes(m.id));
  }

  try {
    const mlRes = await fetch(
      `${TMDB_BASE_URL}/discover/movie?with_original_language=ml&primary_release_date.lte=2005-01-01&sort_by=vote_count.desc&api_key=${apiKey}`, 
      { next: { revalidate: 3600 } }
    );

    if (!mlRes.ok) {
      return [...customOverrides, ...deduplicatedMocks].filter(m => !hiddenIds.includes(m.id));
    }

    const mlData = await mlRes.json();
    const combined = mlData.results.slice(0, 10);
    
    let movies: Movie[] = combined.map((m: any) => ({
      id: m.id.toString(),
      title: m.title || m.original_title,
      poster: m.poster_path ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}` : '',
      backdrop: m.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${m.backdrop_path}` : '',
      director: 'Explore for credits...', 
      year: m.release_date ? m.release_date.substring(0, 4) : 'N/A',
      synopsis: m.overview,
      language: m.original_language,
      cast: [] 
    }));

    movies.unshift(AADU_2_CUSTOM);

    const customIds = customOverrides.map(m => m.id);
    const filteredMovies = movies.filter(m => !customIds.includes(m.id));

    const completeStream = [...customOverrides, ...filteredMovies].filter(m => !hiddenIds.includes(m.id));
    return completeStream;

  } catch (error) {
    return [...customOverrides, ...deduplicatedMocks].filter(m => !hiddenIds.includes(m.id));
  }
}



export async function getMovieById(id: string): Promise<Movie | undefined> {
  const hiddenIds = await getHiddenMovieIds();
  if (hiddenIds.includes(id)) return undefined;

  const customOverrides = await getCustomMovies();
  const matchedCustom = customOverrides.find(m => m.id === id);
  if (matchedCustom) return matchedCustom;

  if (id === AADU_2_CUSTOM.id) {
    return AADU_2_CUSTOM;
  }

  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    return mockMovies.find(m => m.id === id);
  }

  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?append_to_response=credits,videos&api_key=${apiKey}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
       return mockMovies.find(m => m.id === id);
    }

    const m = await res.json();
    
    const director = m.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown';
    const cast = m.credits?.cast?.slice(0, 5).map((c: any) => ({
      name: c.name,
      character: c.character,
      image: c.profile_path ? `${TMDB_IMAGE_BASE_URL}${c.profile_path}` : ''
    })) || [];

    let mainVideo = m.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Feature Film');
    if (!mainVideo) {
      mainVideo = m.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') || m.videos?.results?.[0];
    }

    return {
      id: m.id.toString(),
      title: m.title || m.original_title,
      poster: m.poster_path ? `${TMDB_IMAGE_BASE_URL}${m.poster_path}` : '',
      backdrop: m.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${m.backdrop_path}` : '',
      director: director,
      year: m.release_date ? m.release_date.substring(0, 4) : 'N/A',
      synopsis: m.overview,
      language: m.original_language,
      cast: cast,
      trailerKey: mainVideo?.key
    };
  } catch (error) {
    return mockMovies.find(m => m.id === id);
  }
}
