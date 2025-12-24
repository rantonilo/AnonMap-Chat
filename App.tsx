
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UserProfile, 
  GeoLocation, 
  NearbyUser, 
  AppState, 
  ActiveChat,
  ChatMessage 
} from './types';
import { 
  getStoredProfile, 
  fetchNearbyUsers, 
  updateProfile 
} from './services/mockService';
import MapView from './components/MapView';
import ChatInterface from './components/ChatInterface';
import BrutalButton from './components/BrutalButton';
import { Icons } from './constants';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [gpsLocation, setGpsLocation] = useState<GeoLocation | null>(null);
  const [scanCenter, setScanCenter] = useState<GeoLocation | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [activeTab, setActiveTab] = useState<AppState>(AppState.MAP);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVanishAlert, setShowVanishAlert] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const magicScanTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsLocation(loc);
          setScanCenter(loc);
        },
        (err) => {
          setError("Accès localisation refusé.");
          const fallback = { lat: 48.8566, lng: 2.3522 };
          setGpsLocation(fallback);
          setScanCenter(fallback);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleScan = useCallback((isSilent: boolean = false) => {
    if (!scanCenter) return;
    
    if (magicScanTimerRef.current) {
      clearTimeout(magicScanTimerRef.current);
      magicScanTimerRef.current = null;
    }

    if (!isSilent) setIsScanning(true);

    setTimeout(() => {
      const results = fetchNearbyUsers(scanCenter);
      setNearbyUsers(results);
      if (!isSilent) setIsScanning(false);
      setActiveTab(AppState.MAP);
    }, 1200);
  }, [scanCenter]);

  useEffect(() => {
    if (scanCenter) {
      if (magicScanTimerRef.current) clearTimeout(magicScanTimerRef.current);
      magicScanTimerRef.current = setTimeout(() => handleScan(true), 1000);
    }
    return () => { if (magicScanTimerRef.current) clearTimeout(magicScanTimerRef.current); };
  }, [scanCenter, handleScan]);

  const handleResetToGps = () => {
    if (gpsLocation) setScanCenter({ ...gpsLocation });
  };

  const handleResetPseudo = () => {
    const updated = updateProfile();
    setProfile(updated);
    setNearbyUsers([]); 
    setActiveChat(null); 
    setShowVanishAlert(true);
    setTimeout(() => setShowVanishAlert(false), 3000);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSelectUser = (user: NearbyUser) => {
    const newChat: ActiveChat = {
      id: `chat-${user.id}`,
      participant: user,
      messages: [{ id: 'init-1', senderId: 'system', senderPseudo: 'SYSTEM', text: `Session éphémère établie.`, timestamp: Date.now() }],
      unreadCount: 0
    };
    setActiveChat(newChat);
    setActiveTab(AppState.CHAT);
  };

  const sendMessage = (text: string) => {
    if (!activeChat) return;
    const newMessage: ChatMessage = { id: Date.now().toString(), senderId: profile.id, senderPseudo: profile.pseudo, text, timestamp: Date.now() };
    setActiveChat(prev => prev ? ({...prev, messages: [...prev.messages, newMessage]}) : null);
    setTimeout(() => {
        const reply: ChatMessage = { id: (Date.now() + 1).toString(), senderId: activeChat.participant.id, senderPseudo: activeChat.participant.pseudo, text: `Vu.`, timestamp: Date.now() };
        setActiveChat(prev => prev ? ({...prev, messages: [...prev.messages, reply]}) : null);
    }, 1000);
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-[#f0f0f0] dark:bg-fb-dark text-black transition-colors duration-300 overflow-hidden">
      {showVanishAlert && (
        <div className="fixed top-0 left-0 w-full z-[5000] bg-black text-white p-4 text-center font-black animate-bounce brutal-border-b safe-pt">
          IDENTITÉ EFFACÉE • GHOST OFFSET RÉINITIALISÉ
        </div>
      )}

      <aside className="hidden md:flex w-80 brutal-border-r flex-col bg-white dark:bg-fb-surface">
        <div className="p-6 brutal-border-b bg-brutal-yellow">
          <h1 className="text-4xl font-black uppercase leading-none mb-2 text-black">AnonMap</h1>
          <p className="text-xs font-bold mono text-black/70 uppercase">No logs. Just proximity.</p>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="brutal-border p-4 bg-gray-50 dark:bg-fb-dark brutal-shadow">
            <h3 className="text-xs font-black uppercase mb-1 text-black dark:text-gray-400">SESSION ACTUELLE</h3>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold mono truncate pr-2 text-black dark:text-white">{profile.pseudo}</span>
              <button onClick={handleResetPseudo} className="hover:rotate-180 transition-transform duration-500 p-1 text-black dark:text-white">
                <Icons.Refresh />
              </button>
            </div>
          </div>

          <nav className="space-y-3">
             <BrutalButton onClick={() => setActiveTab(AppState.MAP)} variant={activeTab === AppState.MAP ? 'primary' : 'outline'} className="w-full justify-start">
               <Icons.Map /> CARTE
             </BrutalButton>
             <BrutalButton onClick={() => handleScan(false)} variant={isScanning ? 'accent' : 'outline'} className="w-full justify-start" disabled={isScanning}>
               <Icons.Scan /> {isScanning ? 'SCAN...' : 'SCANNER'}
             </BrutalButton>
             <BrutalButton onClick={toggleDarkMode} variant="outline" className="w-full justify-start bg-white dark:bg-fb-dark">
                {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
                THEME
             </BrutalButton>
          </nav>
        </div>
      </aside>

      <main className="flex-1 relative overflow-hidden bg-[#e5e7eb] dark:bg-fb-dark">
        {activeTab === AppState.MAP && gpsLocation && scanCenter && (
          <MapView 
            gpsLocation={gpsLocation}
            scanCenter={scanCenter}
            onSetScanCenter={setScanCenter}
            nearbyUsers={nearbyUsers} 
            onSelectUser={handleSelectUser}
            onResetToGps={handleResetToGps}
            profile={profile}
          />
        )}

        {activeTab === AppState.CHAT && activeChat && (
          <ChatInterface chat={activeChat} myPseudo={profile.pseudo} onBack={() => setActiveTab(AppState.MAP)} onSendMessage={sendMessage} />
        )}

        {!gpsLocation && (
          <div className="h-full flex flex-col items-center justify-center p-10 text-center"><div className="animate-spin mb-4 scale-150"><Icons.Refresh /></div><h2 className="text-3xl font-black uppercase">GPS...</h2></div>
        )}
      </main>

      <nav className="md:hidden brutal-border-t bg-white dark:bg-fb-surface flex justify-around p-3 z-[2000] safe-pb">
        <button onClick={() => setActiveTab(AppState.MAP)} className={`p-4 brutal-border brutal-shadow-hover ${activeTab === AppState.MAP ? 'bg-brutal-yellow' : 'bg-white dark:bg-fb-dark text-black dark:text-white'}`}><Icons.Map /></button>
        <button onClick={() => handleScan(false)} className={`p-4 brutal-border brutal-shadow-hover ${isScanning ? 'bg-brutal-green animate-pulse' : 'bg-white dark:bg-fb-dark text-black dark:text-white'}`}><Icons.Scan /></button>
        <button onClick={() => setActiveTab(AppState.SETTINGS)} className={`p-4 brutal-border brutal-shadow-hover ${activeTab === AppState.SETTINGS ? 'bg-brutal-pink' : 'bg-white dark:bg-fb-dark text-black dark:text-white'}`}><Icons.Settings /></button>
      </nav>

      {activeTab === AppState.SETTINGS && (
          <div className="fixed inset-0 z-[3000] bg-white dark:bg-fb-dark p-6 md:hidden text-black dark:text-white overflow-y-auto safe-pt safe-pb">
              <div className="flex justify-between items-center mb-10">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">MOI</h1>
                  <button onClick={() => setActiveTab(AppState.MAP)} className="p-3 brutal-border brutal-shadow bg-white dark:bg-fb-surface text-black dark:text-white"><Icons.ArrowLeft /></button>
              </div>
              <div className="space-y-6">
                <div className="brutal-border p-6 bg-brutal-yellow brutal-shadow text-black">
                    <h3 className="font-black uppercase mb-1 text-xs">Pseudo</h3>
                    <p className="text-2xl font-bold mono mb-4 break-all">{profile.pseudo}</p>
                    <BrutalButton onClick={handleResetPseudo} variant="outline" className="w-full bg-white">VANISH (RESET)</BrutalButton>
                </div>
                <div className="brutal-border p-6 bg-white dark:bg-fb-surface brutal-shadow">
                    <BrutalButton onClick={toggleDarkMode} variant="outline" className="w-full">
                        {isDarkMode ? <Icons.Sun /> : <Icons.Moon />} MODE {isDarkMode ? 'CLAIR' : 'SOMBRE'}
                    </BrutalButton>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
