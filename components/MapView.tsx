
import React, { useEffect, useRef, useState } from 'react';
import { GeoLocation, NearbyUser, MapMode, UserProfile } from '../types';
import { Icons } from '../constants';

interface MapViewProps {
  gpsLocation: GeoLocation;
  scanCenter: GeoLocation;
  onSetScanCenter: (loc: GeoLocation) => void;
  nearbyUsers: NearbyUser[];
  onSelectUser: (user: NearbyUser) => void;
  onResetToGps: () => void;
  profile: UserProfile;
}

const MapView: React.FC<MapViewProps> = ({ 
  gpsLocation, 
  scanCenter, 
  onSetScanCenter, 
  nearbyUsers, 
  onSelectUser,
  onResetToGps,
  profile
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [mode, setMode] = useState<MapMode>('standard');
  const isMovingRef = useRef(false);

  const layers = {
    standard: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    '3d': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'
  };

  // 1. Initialisation unique
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: [scanCenter.lat, scanCenter.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      tap: false, // Important pour mobile
      bounceAtZoomLimits: false
    });

    markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    mapInstanceRef.current.on('movestart', () => { isMovingRef.current = true; });
    mapInstanceRef.current.on('moveend', () => { isMovingRef.current = false; });

    mapInstanceRef.current.on('click', (e: any) => {
      onSetScanCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. FlyTo optimisé (Zéro vibration)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const center = mapInstanceRef.current.getCenter();
    const latDiff = Math.abs(center.lat - scanCenter.lat);
    const lngDiff = Math.abs(center.lng - scanCenter.lng);

    // On ne déplace la caméra que si le changement est notable (> 20 mètres env)
    // ou si la carte n'est pas déjà en train de bouger par l'utilisateur
    if ((latDiff > 0.0002 || lngDiff > 0.0002) && !isMovingRef.current) {
      mapInstanceRef.current.flyTo([scanCenter.lat, scanCenter.lng], 15, {
        animate: true,
        duration: 0.8,
        easeLinearity: 0.25
      });
    }
  }, [scanCenter]);

  // 3. Couches de tuiles
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) tileLayerRef.current.remove();
    tileLayerRef.current = (window as any).L.tileLayer(layers[mode], { maxZoom: 19 }).addTo(mapInstanceRef.current);
  }, [mode]);

  // 4. Marqueurs
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    
    const L = (window as any).L;
    markersGroupRef.current.clearLayers();

    // Marqueur GPS
    const gpsIcon = L.divIcon({
      className: 'gps-point',
      html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([gpsLocation.lat, gpsLocation.lng], { icon: gpsIcon, interactive: false }).addTo(markersGroupRef.current);

    // Ghost (Position Virtuelle)
    const vLat = gpsLocation.lat + profile.virtualOffset.lat;
    const vLng = gpsLocation.lng + profile.virtualOffset.lng;
    const ghostIcon = L.divIcon({
      className: 'ghost-point',
      html: `<div class="w-8 h-8 bg-gray-600/20 rounded-full border-2 border-black/30 flex items-center justify-center italic text-[7px] font-black text-black">GHOST</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([vLat, vLng], { icon: ghostIcon, interactive: false }).addTo(markersGroupRef.current);

    // Marqueur de Scan
    const scanIcon = L.divIcon({
      className: 'scan-point',
      html: `<div class="brutal-border bg-brutal-yellow p-1 shadow-md"><div class="w-4 h-4 border-2 border-black rounded-full flex items-center justify-center"><div class="w-1 h-1 bg-black rounded-full"></div></div></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    L.marker([scanCenter.lat, scanCenter.lng], { icon: scanIcon, zIndexOffset: 1000 }).addTo(markersGroupRef.current);

    L.circle([scanCenter.lat, scanCenter.lng], {
        color: '#000', fillColor: '#FFD100', fillOpacity: 0.05, radius: 1000, weight: 2, dashArray: '5, 10', interactive: false
    }).addTo(markersGroupRef.current);

    // Utilisateurs proches
    nearbyUsers.forEach(user => {
      const userIcon = L.divIcon({
        className: 'user-pin',
        html: `<div class="brutal-border bg-brutal-pink p-1 shadow-md active:scale-90 transition-transform"><div class="w-3 h-3 bg-black rounded-full mx-auto"></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      
      const m = L.marker([user.location.lat, user.location.lng], { icon: userIcon })
        .on('click', (e: any) => { L.DomEvent.stopPropagation(e); onSelectUser(user); })
        .addTo(markersGroupRef.current);
        
      m.bindTooltip(`<b>${user.pseudo}</b>`, { direction: 'top', offset: [0, -10], className: 'brutal-border bg-white font-black px-2 py-1 text-black text-[10px] uppercase shadow-none' });
    });

  }, [gpsLocation, scanCenter, nearbyUsers, profile.virtualOffset]);

  return (
    <div className="w-full h-full relative brutal-border overflow-hidden bg-[#e5e7eb] dark:bg-[#111]">
      <div id="map" ref={mapContainerRef} className="h-full w-full" />
      
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-none safe-pt">
        <div className="bg-white dark:bg-fb-surface brutal-border p-2 brutal-shadow text-[10px] font-black uppercase mono text-black dark:text-white">
          {nearbyUsers.length} GHOSTS ACTIFS
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3 safe-pb">
        <button 
          onClick={(e) => { e.stopPropagation(); onResetToGps(); }} 
          className="brutal-border brutal-shadow p-4 bg-white dark:bg-fb-surface hover:bg-brutal-yellow transition-all active:translate-x-1 active:translate-y-1 active:shadow-none text-black dark:text-white"
        >
          <Icons.Crosshair />
        </button>
        
        <div className="flex flex-col gap-1">
            {Object.keys(layers).map((l) => (
                <button 
                    key={l}
                    onClick={(e) => { e.stopPropagation(); setMode(l as MapMode); }} 
                    className={`brutal-border brutal-shadow px-2 py-1 font-black text-[9px] mono transition-all uppercase ${mode === l ? 'bg-brutal-pink translate-x-1 translate-y-1 shadow-none text-white' : 'bg-white dark:bg-fb-surface text-black dark:text-white'}`}
                >
                    {l === 'standard' ? 'MAP' : l}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;
