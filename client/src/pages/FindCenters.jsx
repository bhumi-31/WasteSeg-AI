import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, Navigation, Search, Loader2, Locate, 
  Trash2, Recycle, Leaf, Target, X, Navigation2,
  Square, ArrowUp, Volume2, VolumeX, ChevronRight,
  AlertTriangle, Smartphone, Laptop, PartyPopper
} from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

// Helper to render icon SVG for Leaflet markers
const getIconSvg = (IconComponent, color = 'white', size = 20) => {
  return ReactDOMServer.renderToString(
    <IconComponent size={size} color={color} strokeWidth={2.5} />
  );
};
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const createDustbinIcon = (color, IconComponent, isNearest = false, isSelected = false) => {
  const size = isSelected ? 48 : isNearest ? 44 : 36;
  const iconSize = isSelected ? 24 : isNearest ? 22 : 18;
  const iconSvg = getIconSvg(IconComponent, 'white', iconSize);
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background: ${isSelected ? '#22c55e' : color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        ${isSelected ? 'animation: pulse 1s infinite;' : isNearest ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        ${iconSvg}
        ${isNearest && !isSelected ? '<div style="position:absolute;top:-8px;right:-8px;background:#22c55e;color:white;font-size:10px;padding:2px 6px;border-radius:10px;font-weight:bold;">Nearest</div>' : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -20]
  });
};

// Google Maps style blue dot for user - using primary color
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="position: relative;">
      <div style="
        position: absolute;
        width: 40px;
        height: 40px;
        background: rgba(42, 91, 75, 0.2);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse-ring 2s infinite;
      "></div>
      <div style="
        width: 18px;
        height: 18px;
        background: hsl(160, 32%, 20%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(42, 91, 75, 0.5);
      "></div>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

// Place types configuration
const PLACE_TYPES = {
  dustbin: { label: 'Dustbins', query: 'amenity=waste_basket', color: 'hsl(var(--muted-foreground))', icon: Trash2 },
  recycling: { label: 'Recycling', query: 'amenity=recycling', color: 'hsl(var(--recyclable))', icon: Recycle },
  waste: { label: 'Waste Disposal', query: 'amenity=waste_disposal', color: 'hsl(var(--hazardous))', icon: Trash2 },
  compost: { label: 'Composting', query: 'landuse=landfill', color: 'hsl(var(--organic))', icon: Leaf }
};

// Haversine formula for distance calculation
const calcDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Calculate bearing between two points
const calcBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - 
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
};

// Format distance
const formatDistance = (km) => {
  if (km < 0.015) return 'Arrived!';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(2)}km`;
};

// Format walking time
const formatTime = (km) => {
  const minutes = Math.round(km / 5 * 60);
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

// Get direction text
const getDirection = (bearing) => {
  const dirs = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'];
  return dirs[Math.round(bearing / 45) % 8];
};

// Map controller - handles smooth panning to user location
function MapController({ userPos, destination, isNavigating, mapRef, shouldFollowUser }) {
  const map = useMap();
  
  useEffect(() => {
    if (mapRef) mapRef.current = map;
  }, [map, mapRef]);
  
  // Smooth pan to user position when it changes
  useEffect(() => {
    if (!userPos || !map) return;
    
    if (shouldFollowUser) {
      if (isNavigating && destination) {
        // During navigation, fit bounds to show both points
        const bounds = L.latLngBounds([userPos, [destination.lat, destination.lng]]);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18, animate: true });
      } else {
        // Smoothly pan to user location
        map.panTo(userPos, { animate: true, duration: 0.5 });
      }
    }
  }, [userPos, destination, isNavigating, map, shouldFollowUser]);
  
  return null;
}

export default function FindCenters() {
  // Location state
  const [userPos, setUserPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  
  // Location tracking state
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [isLocationStale, setIsLocationStale] = useState(false);
  const [staleWarningShown, setStaleWarningShown] = useState(false);
  
  // Places state
  const [placeType, setPlaceType] = useState('dustbin');
  const [places, setPlaces] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [initialDistance, setInitialDistance] = useState(0);
  const [shouldFollowUser, setShouldFollowUser] = useState(true);
  
  // Refs
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastPosRef = useRef(null);
  const staleCheckCountRef = useRef(0);

  // Main geolocation effect - IMPROVED with logging and stale detection
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported in this browser');
      setLoading(false);
      return;
    }

    console.log('[Map] Starting geolocation...');

    // Get initial position first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        console.log(`[Geo] Initial position: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(acc)}m)`);
        
        setUserPos([latitude, longitude]);
        setAccuracy(acc);
        setLastUpdateTime(new Date());
        setUpdateCount(1);
        lastPosRef.current = { lat: latitude, lng: longitude };
        setLoading(false);
      },
      (error) => {
        console.error('[Error] Geolocation error:', error);
        setLocationError(
          error.code === 1 ? 'Location permission denied. Please allow location access.' : 
          error.code === 2 ? 'Location unavailable. Check your device settings.' : 
          'Location request timed out. Please try again.'
        );
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
      }
    );

    // Start watching position for live updates
    console.log('[Watch] Starting watchPosition for live tracking...');
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        const timestamp = new Date();
        
        console.log(`[Geo] Position update #${updateCount + 1}: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(acc)}m)`);
        
        // Check if position actually changed
        if (lastPosRef.current) {
          const distMoved = calcDistance(
            lastPosRef.current.lat, 
            lastPosRef.current.lng, 
            latitude, 
            longitude
          ) * 1000; // Convert to meters
          
          if (distMoved < 0.5) {
            // Position hasn't changed significantly
            staleCheckCountRef.current++;
            console.log(`Position unchanged (${distMoved.toFixed(2)}m moved). Stale count: ${staleCheckCountRef.current}`);
            
            if (staleCheckCountRef.current >= 5 && !staleWarningShown) {
              setIsLocationStale(true);
              setStaleWarningShown(true);
            }
          } else {
            // Position changed!
            staleCheckCountRef.current = 0;
            setIsLocationStale(false);
            console.log(`[Move] Moved ${distMoved.toFixed(2)}m from last position`);
          }
        }
        
        // Update state
        setUserPos([latitude, longitude]);
        setAccuracy(acc);
        setLastUpdateTime(timestamp);
        setUpdateCount(prev => prev + 1);
        lastPosRef.current = { lat: latitude, lng: longitude };
      },
      (error) => {
        console.error('[Error] Watch position error:', error);
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 0, // Always get fresh position
        timeout: 10000 
      }
    );

    return () => {
      if (watchIdRef.current) {
        console.log('🛑 Stopping watchPosition');
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Device orientation for compass
  useEffect(() => {
    if (!isNavigating) return;
    
    const handleOrientation = (e) => {
      if (e.webkitCompassHeading !== undefined) {
        setDeviceHeading(e.webkitCompassHeading);
      } else if (e.alpha !== null) {
        setDeviceHeading(360 - e.alpha);
      }
    };

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [isNavigating]);

  // Check for arrival
  useEffect(() => {
    if (!isNavigating || !userPos || !destination) return;
    
    const dist = calcDistance(userPos[0], userPos[1], destination.lat, destination.lng);
    if (dist < 0.015 && !hasArrived) {
      setHasArrived(true);
      if (soundEnabled && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
  }, [userPos, destination, isNavigating, hasArrived, soundEnabled]);

  // Calculate distances for all places - recalculates on every userPos change
  const placesWithDistance = useMemo(() => {
    if (!userPos || places.length === 0) return [];
    return places.map(place => ({
      ...place,
      distance: calcDistance(userPos[0], userPos[1], place.lat, place.lng)
    })).sort((a, b) => a.distance - b.distance);
  }, [userPos, places]);

  const nearestPlace = useMemo(() => {
    return placesWithDistance.length > 0 ? placesWithDistance[0] : null;
  }, [placesWithDistance]);

  // Current navigation distance and bearing - recalculates on every userPos change
  const navInfo = useMemo(() => {
    if (!isNavigating || !userPos || !destination) return null;
    const dist = calcDistance(userPos[0], userPos[1], destination.lat, destination.lng);
    const bearing = calcBearing(userPos[0], userPos[1], destination.lat, destination.lng);
    const progress = initialDistance > 0 ? Math.max(0, Math.min(100, ((initialDistance - dist) / initialDistance) * 100)) : 0;
    return { distance: dist, bearing, progress };
  }, [userPos, destination, isNavigating, initialDistance]);

  // Search for places
  const searchPlaces = useCallback(async () => {
    if (!userPos) return;
    
    setSearching(true);
    setPlaces([]);
    
    const config = PLACE_TYPES[placeType];
    const [lat, lng] = userPos;
    const [key, value] = config.query.split('=');
    
    try {
      const query = `[out:json][timeout:25];node["${key}"="${value}"](around:3000,${lat},${lng});out body;`;
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`
      });
      
      const data = await response.json();
      
      let foundPlaces = data.elements.map((el, index) => ({
        id: el.id || index,
        lat: el.lat,
        lng: el.lon,
        name: el.tags?.name || `${config.label} #${index + 1}`,
        type: placeType
      })).slice(0, 15);
      
      if (foundPlaces.length === 0) {
        foundPlaces = generateDemoPlaces(userPos, placeType);
      }
      
      setPlaces(foundPlaces);
    } catch (error) {
      console.error('Search error:', error);
      setPlaces(generateDemoPlaces(userPos, placeType));
    }
    
    setSearching(false);
  }, [userPos, placeType]);

  const generateDemoPlaces = (pos, type) => {
    const [lat, lng] = pos;
    const config = PLACE_TYPES[type];
    
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * 2 * Math.PI;
      const distance = 0.002 + Math.random() * 0.008;
      return {
        id: `demo-${i}`,
        lat: lat + distance * Math.cos(angle),
        lng: lng + distance * Math.sin(angle),
        name: `${config.label} #${i + 1}`,
        type: type
      };
    });
  };

  // Start navigation
  const startNavigation = (place) => {
    const dist = calcDistance(userPos[0], userPos[1], place.lat, place.lng);
    setDestination(place);
    setInitialDistance(dist);
    setIsNavigating(true);
    setHasArrived(false);
    setShouldFollowUser(true);
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setDestination(null);
    setHasArrived(false);
    setInitialDistance(0);
  };

  // Center on user
  const centerOnUser = () => {
    if (userPos && mapRef.current) {
      mapRef.current.setView(userPos, 17, { animate: true });
      setShouldFollowUser(true);
    }
  };

  const currentConfig = PLACE_TYPES[placeType];
  const arrowRotation = navInfo ? navInfo.bearing - deviceHeading : 0;

  // Detect if on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <MapPin className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-muted-foreground font-medium">Getting your location...</p>
          <p className="mt-1 text-sm text-muted-foreground">Please allow location access when prompted</p>
        </div>
      </div>
    );
  }

  // Error state
  if (locationError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[hsl(var(--hazardous-light))] rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-[hsl(var(--hazardous))]" />
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground mb-2">Location Required</h2>
          <p className="text-muted-foreground mb-6">{locationError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-hero text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 pt-28 sm:pt-32 pb-24">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Find Nearby</h1>
          <p className="text-white/60">Locate waste disposal points near you</p>
        </div>
        
        {/* Laptop Warning Banner */}
        {isLocationStale && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Laptop className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Limited GPS on Laptop</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Your location isn't changing. Laptops use WiFi-based positioning which has limited accuracy and won't track movement.
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Use a mobile phone for real-time movement tracking.
                </p>
              </div>
              <button 
                onClick={() => setIsLocationStale(false)}
                className="text-amber-500 hover:text-amber-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header - Hidden during navigation */}
        {!isNavigating && (
          <div className="bg-white/5 rounded-2xl shadow-lg border border-white/10 p-4">
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={searchPlaces}
                disabled={searching}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-black rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Object.entries(PLACE_TYPES).map(([key, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setPlaceType(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      placeType === key 
                        ? 'bg-emerald-500 text-black shadow-md' 
                        : 'bg-white/10 text-white/60 hover:bg-white/15'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nearest Place Banner - Hidden during navigation */}
        {nearestPlace && !isNavigating && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <currentConfig.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-medium">Nearest {currentConfig.label.slice(0, -1)}</p>
                  <p className="font-bold text-lg">{formatDistance(nearestPlace.distance)} away</p>
                </div>
              </div>
              <button
                onClick={() => startNavigation(nearestPlace)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
              >
                <Navigation2 className="h-4 w-4" />
                Navigate
              </button>
            </div>
          </div>
        )}

        {/* Navigation Panel */}
        {isNavigating && destination && navInfo && (
          <div className="bg-white/5 rounded-2xl shadow-lg border border-white/10 overflow-hidden">
            {/* Navigation Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={stopNavigation}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="font-bold text-lg">{destination.name}</p>
                    <p className="text-sm text-white/70">{currentConfig.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </button>
              </div>
              
              {hasArrived ? (
                <div className="text-center py-4">
                  <div className="text-green-400 mb-2">
                    <PartyPopper className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-2xl font-bold">You've arrived!</p>
                  <button
                    onClick={stopNavigation}
                    className="mt-4 px-6 py-2 bg-white text-emerald-600 rounded-xl font-medium"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  {/* Direction Arrow */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                      <div 
                        className="transition-transform duration-300 ease-out"
                        style={{ transform: `rotate(${arrowRotation}deg)` }}
                      >
                        <ArrowUp className="h-12 w-12" strokeWidth={3} />
                      </div>
                    </div>
                    <p className="text-center text-sm mt-1 font-medium">{getDirection(navInfo.bearing)}</p>
                  </div>
                  
                  {/* Distance Info */}
                  <div className="flex-1">
                    <p className="text-4xl font-bold">{formatDistance(navInfo.distance)}</p>
                    <p className="text-white/70">{formatTime(navInfo.distance)} walk</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${navInfo.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/70 mt-1">{Math.round(navInfo.progress)}% complete</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Card */}
        <div className="bg-white/5 rounded-2xl shadow-lg border border-white/10 overflow-hidden">
          <div className={`relative ${isNavigating ? 'h-[350px]' : 'h-[400px] md:h-[450px]'}`}>
            {userPos && (
              <MapContainer 
                center={userPos} 
                zoom={16} 
                className="h-full w-full z-0"
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController 
                  userPos={userPos} 
                  destination={destination}
                  isNavigating={isNavigating}
                  mapRef={mapRef}
                  shouldFollowUser={shouldFollowUser}
                />
                
                {/* User location marker - KEY: uses userPos which updates on every watchPosition callback */}
                <Marker position={userPos} icon={userIcon}>
                  <Popup>
                    <div className="text-center py-1">
                      <p className="font-semibold text-gray-900">You are here</p>
                      <p className="text-xs text-gray-500">{userPos[0].toFixed(6)}, {userPos[1].toFixed(6)}</p>
                      <p className="text-xs text-gray-400 mt-1">Accuracy: ±{Math.round(accuracy || 0)}m</p>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Dynamic accuracy circle - uses actual GPS accuracy */}
                <Circle 
                  center={userPos} 
                  radius={accuracy || 30}
                  pathOptions={{ 
                    color: accuracy > 50 ? '#f59e0b' : 'hsl(160, 32%, 26%)', 
                    fillColor: accuracy > 50 ? '#f59e0b' : 'hsl(160, 32%, 26%)', 
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: accuracy > 50 ? '5, 5' : undefined
                  }} 
                />
                
                {/* Route line during navigation */}
                {isNavigating && destination && (
                  <Polyline
                    positions={[userPos, [destination.lat, destination.lng]]}
                    pathOptions={{ 
                      color: 'hsl(160, 32%, 26%)', 
                      weight: 5, 
                      opacity: 0.8,
                      dashArray: '10, 10'
                    }}
                  />
                )}
                
                {/* Place markers */}
                {placesWithDistance.map((place, index) => {
                  const IconComponent = currentConfig.icon;
                  return (
                    <Marker 
                      key={place.id}
                      position={[place.lat, place.lng]}
                      icon={createDustbinIcon(
                        currentConfig.color, 
                        currentConfig.icon, 
                        index === 0,
                        isNavigating && destination?.id === place.id
                      )}
                    >
                      <Popup>
                        <div className="min-w-[180px] py-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl" style={{ color: currentConfig.color }}>
                              <IconComponent className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">{place.name}</p>
                              <p className="text-xs text-gray-500">{currentConfig.label}</p>
                            </div>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-2 mb-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Distance</span>
                              <span className="font-bold text-emerald-600">{formatDistance(place.distance)}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-gray-600">Walk time</span>
                            <span className="text-sm text-gray-900">{formatTime(place.distance)}</span>
                          </div>
                        </div>
                        {!isNavigating && (
                          <button
                            onClick={() => startNavigation(place)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:opacity-90"
                          >
                            <Navigation2 className="h-3.5 w-3.5" />
                            Start Navigation
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                  );
                })}
              </MapContainer>
            )}
            
            {/* Map Controls */}
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={centerOnUser}
                className={`p-3 rounded-full shadow-lg transition-all ${
                  shouldFollowUser 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20'
                }`}
                title="Center on my location"
              >
                <Locate className="h-5 w-5" />
              </button>
            </div>
            
            {/* Live indicator with update count */}
            <div className="absolute top-4 left-4 z-[1000]">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full shadow-md border border-white/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                </span>
                <span className="text-xs font-medium text-white">
                  {isNavigating ? 'Navigating' : 'Live'} 
                  <span className="text-white/60 ml-1">#{updateCount}</span>
                </span>
              </div>
            </div>

            {/* Stop Navigation Button (Floating) */}
            {isNavigating && !hasArrived && (
              <div className="absolute bottom-4 left-4 z-[1000]">
                <button
                  onClick={stopNavigation}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full shadow-lg font-medium hover:opacity-90 transition-opacity"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Places List - Hidden during navigation */}
        {placesWithDistance.length > 0 && !isNavigating && (
          <div className="bg-white/5 rounded-2xl shadow-lg border border-white/10 p-4">
            <h2 className="font-semibold font-heading text-white mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              Nearby {currentConfig.label} ({placesWithDistance.length})
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {placesWithDistance.map((place, index) => {
                const IconComponent = currentConfig.icon;
                return (
                <div
                  key={place.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer hover:bg-white/10 ${
                    index === 0 ? 'bg-green-500/20 border border-green-500/30' : ''
                  }`}
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.setView([place.lat, place.lng], 18, { animate: true });
                      setShouldFollowUser(false);
                    }
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: currentConfig.color + '20', color: currentConfig.color }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {index === 0 && <span className="text-green-400 mr-1">★</span>}
                      {place.name}
                    </p>
                    <p className="text-sm text-white/60">
                      {formatTime(place.distance)} walk
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-bold ${index === 0 ? 'text-green-400' : 'text-emerald-400'}`}>
                        {formatDistance(place.distance)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startNavigation(place);
                      }}
                      className="p-2 bg-emerald-500 text-black rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!searching && places.length === 0 && !isNavigating && (
          <div className="bg-white/5 rounded-2xl shadow-lg border border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold font-heading text-white mb-2">
              Ready to Search
            </h3>
            <p className="text-white/60 mb-4">
              Click the Search button to find nearby {currentConfig.label.toLowerCase()}
            </p>
            <button
              onClick={searchPlaces}
              className="px-6 py-2.5 bg-emerald-500 text-black rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Search {currentConfig.label}
            </button>
          </div>
        )}
      </div>
      
      {/* CSS for animations */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 12px !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
      `}</style>
    </div>
  );
}
