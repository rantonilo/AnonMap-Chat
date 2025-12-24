
export interface UserProfile {
  id: string;
  pseudo: string;
  lastReset: number;
  virtualOffset: {
    lat: number;
    lng: number;
  };
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface NearbyUser {
  id: string;
  pseudo: string;
  location: GeoLocation;
  distance: number;
  status: 'online' | 'away';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderPseudo: string;
  text: string;
  timestamp: number;
}

export interface ActiveChat {
  id: string;
  participant: NearbyUser;
  messages: ChatMessage[];
  unreadCount: number;
}

export enum AppState {
  MAP = 'MAP',
  SCANNING = 'SCANNING',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS'
}

export type MapMode = 'standard' | 'satellite' | '3d';
