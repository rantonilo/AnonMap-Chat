
import { GeoLocation } from '../types';

export const getDistance = (loc1: GeoLocation, loc2: GeoLocation): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(loc2.lat - loc1.lat);
  const dLon = deg2rad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export const generateNearbyPositions = (center: GeoLocation, count: number): GeoLocation[] => {
  const positions: GeoLocation[] = [];
  for (let i = 0; i < count; i++) {
    const r = 0.01 * Math.sqrt(Math.random()); // roughly 1km max radius
    const theta = Math.random() * 2 * Math.PI;
    positions.push({
      lat: center.lat + r * Math.cos(theta),
      lng: center.lng + r * Math.sin(theta)
    });
  }
  return positions;
};
