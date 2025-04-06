import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Profile {
  name: string;
  gradeLevel: string;
  avatar: string;
  preferredSubjects: string[];
  favoriteThemes?: string[];
  characterPreference?: string;
  learningStyle?: string;
  age?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
}

const defaultProfile: Profile = {
  name: '',
  gradeLevel: '',
  avatar: '1',
  preferredSubjects: [],
  favoriteThemes: [],
  characterPreference: '',
  learningStyle: '',
  age: ''
};

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  setProfile: () => {},
  clearProfile: () => {}
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<Profile | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('kidscholar_profile');
    if (savedProfile) {
      try {
        setProfileState(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error parsing saved profile:', e);
      }
    }
  }, []);

  const setProfile = (newProfile: Profile) => {
    setProfileState(newProfile);
    localStorage.setItem('kidscholar_profile', JSON.stringify(newProfile));
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('kidscholar_profile');
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
