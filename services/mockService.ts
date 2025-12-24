
import { UserProfile, NearbyUser, GeoLocation } from '../types';
import { generateNearbyPositions, getDistance } from '../utils/geoUtils';

const ADJECTIVES = ['Silent', 'Neon', 'Fast', 'Mystic', 'Digital', 'Shadow', 'Ghost', 'Urban', 'Cyber', 'Swift'];
const NOUNS = ['Hacker', 'Runner', 'Drifter', 'Echo', 'Pixel', 'Wave', 'Prowler', 'Nomad', 'Zenith', 'Void'];

export const generatePseudo = (): string => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
};

// Génère un petit décalage aléatoire (approx 100-300m)
const generateRandomOffset = () => ({
  lat: (Math.random() - 0.5) * 0.004,
  lng: (Math.random() - 0.5) * 0.004
});

export const getStoredProfile = (): UserProfile => {
  const stored = localStorage.getItem('anon_profile');
  if (stored) {
    const profile = JSON.parse(stored);
    if (Date.now() - profile.lastReset < 24 * 60 * 60 * 1000) {
      if (!profile.virtualOffset) profile.virtualOffset = generateRandomOffset();
      return profile;
    }
  }
  
  const newProfile: UserProfile = {
    id: Math.random().toString(36).substr(2, 9),
    pseudo: generatePseudo(),
    lastReset: Date.now(),
    virtualOffset: generateRandomOffset()
  };
  localStorage.setItem('anon_profile', JSON.stringify(newProfile));
  return newProfile;
};

export const updateProfile = (newPseudo?: string): UserProfile => {
  const current = getStoredProfile();
  const updated: UserProfile = {
    ...current,
    pseudo: newPseudo || generatePseudo(),
    lastReset: Date.now(),
    virtualOffset: generateRandomOffset() // Nouveau saut géographique
  };
  localStorage.setItem('anon_profile', JSON.stringify(updated));
  return updated;
};

export const fetchNearbyUsers = (center: GeoLocation): NearbyUser[] => {
  const locs = generateNearbyPositions(center, 5 + Math.floor(Math.random() * 5));
  return locs.map((loc, idx) => {
    const dist = getDistance(center, loc);
    return {
      id: `remote-${idx}-${Math.random()}`,
      pseudo: generatePseudo(),
      location: loc,
      distance: dist,
      status: Math.random() > 0.2 ? 'online' : 'away'
    };
  });
};
