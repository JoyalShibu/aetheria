'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Profile {
  id: string;
  name: string;
  color: string;
}

interface ProfileContextType {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  profiles: Profile[];
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not signed in, Clear the active profile cookie just in case
        document.cookie = 'aetheria_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setIsLoading(false);
        return;
      }

      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (dbProfiles) {
        setProfiles(dbProfiles);
      }

      // Rehydrate on mount
      const stored = document.cookie
        .split('; ')
        .find((row) => row.startsWith('aetheria_profile='))
        ?.split('=')[1];
        
      if (stored) {
        try {
          const parsed = JSON.parse(decodeURIComponent(stored));
          // Verify it matches one of the user's profiles
          if (dbProfiles?.some((p) => p.id === parsed.id)) {
            setActiveProfileState(parsed);
          } else {
            document.cookie = 'aetheria_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        } catch (e) {
          // ignore
        }
      }
      setIsLoading(false);
    }
    
    loadData();
  }, []);

  const setActiveProfile = (profile: Profile | null) => {
    setActiveProfileState(profile);
    if (profile) {
      document.cookie = `aetheria_profile=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=31536000`; // 1 year expiry
    } else {
      document.cookie = 'aetheria_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile, profiles, isLoading }}>
      {/* Hide content while determining auth state, to avoid hydration flickering */}
      {!isLoading ? children : null}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

