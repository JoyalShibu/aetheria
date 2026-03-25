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
    const stored = localStorage.getItem('aetheria_profile');
    if (stored) {
      try {
        setActiveProfileState(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    }
    setIsLoading(false);
  }, []);

  const setActiveProfile = (profile: Profile | null) => {
    setActiveProfileState(profile);
    if (profile) {
      localStorage.setItem('aetheria_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('aetheria_profile');
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
