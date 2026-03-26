'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface Profile {
  id: string;
  name: string;
  color: string;
}

interface ProfileContextType {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const MOCK_PROFILES: Profile[] = [
  { id: '1', name: 'Arjun', color: '#00e5ff' }, // Neon Cyan
  { id: '2', name: 'Karthik', color: '#ff3366' }, // Bright Coral
  { id: '3', name: 'Sneha', color: '#9d00ff' }, // Deep Purple
];

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Rehydrate on mount
    const stored = document.cookie
      .split('; ')
      .find((row) => row.startsWith('aetheria_profile='))
      ?.split('=')[1];
      
    if (stored) {
      try {
        setActiveProfileState(JSON.parse(decodeURIComponent(stored)));
      } catch (e) {
        // ignore
      }
    }
    setIsLoading(false);
  }, []);

  const setActiveProfile = (profile: Profile | null) => {
    setActiveProfileState(profile);
    if (profile) {
      document.cookie = `aetheria_profile=${encodeURIComponent(JSON.stringify(profile))}; path=/; max-age=31536000`; // 1 year expiry
    } else {
      document.cookie = 'aetheria_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = pathname === '/profiles' || pathname.startsWith('/admin');
    if (!activeProfile && !isPublicRoute) {
      router.replace('/profiles');
    }
  }, [activeProfile, isLoading, pathname, router]);

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile, isLoading }}>
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
