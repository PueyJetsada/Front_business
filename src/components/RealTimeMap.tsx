import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BACKEND_API_URL } from '../config/api';
import type { RideHop } from '../data/mockData';
import realCampusRoutes from '../data/realCampusRoutes.json';

export interface RealTimeMapProps {
  rides: RideHop[];
  selectedRideId?: string | null;
  isPremium: boolean;
  isBooked?: boolean;
  lang?: 'th' | 'en';
  destinationName?: string;
  destinationPos?: [number, number];
  onDestinationChange?: (name: string, pos: [number, number]) => void;
  onSelectRide: (rideId: string) => void;
  selectionTrigger?: number;
  recenterTrigger?: number;
  onRequestFinishTrip?: () => void;
  isModalOpen?: boolean;
  className?: string;
}

// 100% REAL ROAD ROUTES (Fallback & Initial Base)
const DEFAULT_ROUTES: Record<string, [number, number][]> = realCampusRoutes as unknown as Record<string, [number, number][]>;

import {
  QUICK_LANDMARKS,
  getLandmarkCoords,
  findNearestLandmark,
  calculateDistanceMeters,
  searchAnyPlace,
  type GeocodePlace,
} from '../utils/geocoding';

export {
  QUICK_LANDMARKS,
  getLandmarkCoords,
  findNearestLandmark,
  calculateDistanceMeters,
  searchAnyPlace,
};
export type { GeocodePlace };

/**
 * Calculate compass bearing (degrees 0-360) between two points so the car faces forward along the road
 */
function calculateBearing(p1: [number, number], p2: [number, number]): number {
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(dLon);
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}

/**
 * Interpolates smooth coordinates and bearing along a multi-segment real road polyline
 */
function getCoordinateAlongRoute(
  route: [number, number][],
  progress: number
): { pos: [number, number]; bearing: number } {
  if (!route || route.length === 0) return { pos: [14.072123, 100.605301], bearing: 90 };
  if (route.length === 1 || progress <= 0) return { pos: route[0], bearing: 90 };
  if (progress >= 1) return { pos: route[route.length - 1], bearing: 180 };

  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const dLat = route[i + 1][0] - route[i][0];
    const dLng = route[i + 1][1] - route[i][1];
    const len = Math.sqrt(dLat * dLat + dLng * dLng);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) return { pos: route[0], bearing: 90 };

  const targetDist = progress * totalLength;
  let accumulated = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDist) {
      const fraction = segLen === 0 ? 0 : (targetDist - accumulated) / segLen;
      const p1 = route[i];
      const p2 = route[i + 1];
      const pos: [number, number] = [
        p1[0] + (p2[0] - p1[0]) * fraction,
        p1[1] + (p2[1] - p1[1]) * fraction,
      ];
      const bearing = calculateBearing(p1, p2);
      return { pos, bearing };
    }
    accumulated += segLen;
  }

  return { pos: route[route.length - 1], bearing: 180 };
}

export const RealTimeMap: React.FC<RealTimeMapProps> = ({
  rides,
  selectedRideId,
  isPremium,
  isBooked = false,
  lang = 'th',
  destinationName: propDestinationName,
  destinationPos: propDestinationPos,
  onDestinationChange: _onDestinationChange,
  onSelectRide,
  selectionTrigger = 0,
  recenterTrigger = 0,
  onRequestFinishTrip,
  isModalOpen = false,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const glowLayerRef = useRef<L.Polyline | null>(null);
  const approachLayerRef = useRef<L.Polyline | null>(null);
  const vehiclesLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarksLayerRef = useRef<L.LayerGroup | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const hasAutoFinishedRef = useRef<boolean>(false);
  const [isHudExpanded, setIsHudExpanded] = useState<boolean>(true);

  // Selected Ride (null if haven't chosen a driver yet)
  const selectedRide = useMemo(() => {
    if (!selectedRideId) return null;
    return rides.find((r) => r.id === selectedRideId) || null;
  }, [rides, selectedRideId]);

  // User spec: "for ดูเเผนที่ it should not show where the driver is until you select who the driver after you select the driver/or book the driver you will see it/ prebook not see yet tho until reach the day"
  const [simulatedPrebookDayReached, setSimulatedPrebookDayReached] = useState<boolean>(false);
  const isPrebook = selectedRide?.mode === 'prebook';
  const canShowDriverLocation = Boolean(
    selectedRide &&
    isBooked &&
    (!isPrebook || simulatedPrebookDayReached)
  );

  // Perspective View: Passenger View (Spec: ผู้โดยสารเห็นรถเฉพาะเมื่อจองแล้ว)
  const [viewRole] = useState<'passenger' | 'driver'>('passenger');

  // Onboard Stage (Spec: พอขึ้นรถหมุดผู้โดยสารกับคนขับอันเดียวกัน)
  const [isOnboard, setIsOnboard] = useState<boolean>(false);

  // USER'S CURRENT LOCATION (ตำแหน่งปัจจุบันของคุณ - Where you are currently at)
  const [userCurrentPos, setUserCurrentPos] = useState<[number, number]>([14.0722, 100.6053]);
  const [userLocationName, setUserLocationName] = useState<string>('SIIT รังสิต');
  const MAX_PICKUP_WALK_METERS = 300; // Strict Guardrail: Pickup point must be near current location (<= 300m)
  const [pickupAlertMsg, setPickupAlertMsg] = useState<string>('');

  // 1. SELECTABLE & DRAGGABLE STARTING POINT (จุดรับ - Defaults strictly to where you currently are)
  const [customPickupPos, setCustomPickupPos] = useState<[number, number]>([14.0722, 100.6053]);
  const [customPickupName, setCustomPickupName] = useState<string>('SIIT รังสิต');
  const [pickupWalkMeters, setPickupWalkMeters] = useState<number>(0);
  const [isPickupOutOfRange, setIsPickupOutOfRange] = useState<boolean>(false);

  // Dynamic bilingual displays for user location and custom pickup
  const userLocationDisplay =
    userLocationName === 'ตำแหน่ง GPS ของคุณ' || userLocationName === 'Your GPS Location'
      ? (lang === 'en' ? 'Your GPS Location' : 'ตำแหน่ง GPS ของคุณ')
      : (userLocationName === 'SIIT รังสิต' || userLocationName === 'SIIT Rangsit')
      ? (lang === 'en' ? 'SIIT Rangsit' : 'SIIT รังสิต')
      : userLocationName;

  const customPickupDisplay =
    pickupWalkMeters <= 15
      ? (lang === 'en' ? `${userLocationDisplay} (Your Location)` : `${userLocationDisplay} (ตำแหน่งที่คุณอยู่)`)
      : (lang === 'en' ? `Pickup spot (Walk ${pickupWalkMeters}m)` : `จุดรับใกล้คุณ (เดิน ${pickupWalkMeters}m)`);

  // 2. DESTINATION (LOCKED TO MATCH DRIVER'S DROP-OFF POINT)
  const [destinationPos, setDestinationPos] = useState<[number, number]>(
    propDestinationPos || [14.0668, 100.6105]
  );
  const [destinationName, setDestinationName] = useState<string>(
    propDestinationName || 'คอนโด B'
  );

  // 3. DYNAMIC ROUTE & REAL DISTANCE CALCULATED VIA GOOGLE MAPS API
  const [activeRoute, setActiveRoute] = useState<[number, number][]>(
    (selectedRide?.id && DEFAULT_ROUTES[selectedRide.id]) || DEFAULT_ROUTES['hop-z'] || []
  );
  const [totalTripMeters, setTotalTripMeters] = useState<number>(2300);
  const [totalTripSeconds, setTotalTripSeconds] = useState<number>(360);
  const [, setRoutingProvider] = useState<string>('Google Maps Directions');

  // Simulation State
  const [selectedProgress, setSelectedProgress] = useState(0.01);
  const [isSimulating] = useState(true);
  const speedMultiplier = 1.0; // Realistic real-time campus travel speed

  // Leg Distances: Approach Leg (Driver -> Pickup) + Trip Leg (Pickup -> Destination)
  const [approachRoute, setApproachRoute] = useState<[number, number][]>([]);
  const [approachMeters, setApproachMeters] = useState<number>(450);
  const [tripMeters, setTripMeters] = useState<number>(1266);
  const [pickupRatio, setPickupRatio] = useState<number>(0.26);

  // Automatic Boarding Toast when driver reaches pickup point
  const [boardingToast, setBoardingToast] = useState<string>('');

  // Determine driver initial location before driving to pick up the student (Starts ~450m away)
  const getDriverStartPos = useCallback((pickup: [number, number]): [number, number] => {
    // If pickup is in TU Rangsit area
    const isAtRangsit = Math.abs(pickup[0] - 14.072) < 0.03 && Math.abs(pickup[1] - 100.605) < 0.03;
    if (isAtRangsit) {
      if (selectedRide?.id === 'hop-y') return [14.0750, 100.6053]; // Driver Y coming from Gym 4
      if (selectedRide?.id === 'hop-nicha') return [14.0710, 100.6101]; // Nicha coming from Puey Park
      return [14.0721, 100.6095]; // Zack coming from SC Building along Pridi road
    }

    // For any real GPS location (e.g. Bangkadi, Tiwanon, etc.):
    // Place driver ~450 meters away along the road so the car visibly drives to the user!
    return [pickup[0] + 0.0032, pickup[1] + 0.0022];
  }, [selectedRide?.id]);

  // Fetch Full Journey: Clean direct route from Pickup directly to Destination!
  const fetchRealRoute = useCallback(
    async (pickup: [number, number], dest: [number, number]) => {
      const driverStart = getDriverStartPos(pickup);

      try {
        // Query Leg 2: Direct path from Pickup to Destination!
        const leg2Url = `${BACKEND_API_URL}/distance?origin=${pickup[0]},${pickup[1]}&destination=${dest[0]},${dest[1]}`;
        // Query Leg 1: Driver approach path from driver initial location to Pickup point
        const leg1Url = `${BACKEND_API_URL}/distance?origin=${driverStart[0]},${driverStart[1]}&destination=${pickup[0]},${pickup[1]}`;

        const [res2, res1] = await Promise.all([fetch(leg2Url), fetch(leg1Url)]);
        const [data2, data1] = await Promise.all([res2.json(), res1.json()]);

        const tripCoords: [number, number][] =
          data2.success && data2.coordinates && data2.coordinates.length > 1
            ? data2.coordinates
            : [pickup, dest];

        const approachCoords: [number, number][] =
          data1.success && data1.coordinates && data1.coordinates.length > 1
            ? data1.coordinates
            : [driverStart, pickup];

        const dist1 = data1.distanceMeters || 450;
        const dist2 = data2.distanceMeters || calculateDistanceMeters(pickup, dest);
        const total = dist1 + dist2;
        const ratio = Math.max(0.12, Math.min(0.45, dist1 / total));

        // The route displayed on the map is strictly the clean, direct path from pickup to destination!
        setActiveRoute(tripCoords);
        setApproachRoute(approachCoords);
        setApproachMeters(dist1);
        setTripMeters(dist2);
        setTotalTripMeters(dist2); // Direct trip distance between pickup and destination
        setTotalTripSeconds(data2.durationSeconds || Math.max(50, Math.round(dist2 / 8)));
        setPickupRatio(ratio);
        setRoutingProvider(data2.provider || 'Google Maps');
        setSelectedProgress(0.01);
        setIsOnboard(false);
        setBoardingToast('');
        return;
      } catch (err) {
        console.warn('Backend routing query fallback, trying OSRM:', err);
      }

      // Try public OpenStreetMap OSRM routing before straight-line fallback
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates?.length > 1) {
            const tripCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]]
            );
            const dist = Math.round(data.routes[0].distance);
            const dur = Math.round(data.routes[0].duration);
            setActiveRoute(tripCoords);
            setApproachRoute([[driverStart[0], driverStart[1]], pickup]);
            setApproachMeters(450);
            setTripMeters(dist);
            setTotalTripMeters(dist);
            setTotalTripSeconds(dur || Math.max(50, Math.round(dist / 8)));
            setRoutingProvider('OSRM Road Routing');
            setSelectedProgress(0.01);
            setIsOnboard(false);
            setBoardingToast('');
            return;
          }
        }
      } catch {
        // fallback to straight line
      }

      // Clean direct fallback: exactly from pickup to destination
      const fallbackTrip: [number, number][] = [pickup, dest];
      const fallbackDist = calculateDistanceMeters(pickup, dest);
      setActiveRoute(fallbackTrip);
      setApproachRoute([driverStart, pickup]);
      setApproachMeters(450);
      setTripMeters(fallbackDist);
      setTotalTripMeters(fallbackDist);
      setTotalTripSeconds(Math.max(50, Math.round(fallbackDist / 8)));
      setPickupRatio(0.26);
      setSelectedProgress(0.01);
      setIsOnboard(false);
    },
    [getDriverStartPos]
  );

  // Initial setup for the selected ride
  useEffect(() => {
    const defaultStart: [number, number] = [14.0722, 100.6053];
    let defaultDest: [number, number] = [14.0664, 100.6095];
    let defaultDestName = 'หน้า Kave TU';

    if (selectedRide?.id === 'hop-y') {
      defaultDest = [14.0668, 100.6105];
      defaultDestName = 'ล็อบบี้ คอนโด B';
    } else if (selectedRide?.id === 'hop-nicha') {
      defaultDest = [14.0628, 100.5975];
      defaultDestName = 'TU Dome Residential';
    }

    // Check if the user has a saved GPS position from their device
    const savedGps = localStorage.getItem('campushop_user_gps');
    let startPos = defaultStart;
    let startLabel = selectedRide?.origin || 'SIIT รังสิต';

    if (savedGps) {
      try {
        const parsed = JSON.parse(savedGps);
        if (parsed.lat && parsed.lon) {
          startPos = [parsed.lat, parsed.lon];
          startLabel = parsed.name || 'ตำแหน่ง GPS ของคุณ';
        }
      } catch {
        // ignore
      }
    }

    setUserCurrentPos(startPos);
    setUserLocationName(startLabel);
    setCustomPickupPos(startPos);
    setCustomPickupName(startLabel);
    setDestinationPos(defaultDest);
    setDestinationName(selectedRide?.actualDropOffName || defaultDestName);
    setPickupWalkMeters(0);
    setIsPickupOutOfRange(false);
    setPickupAlertMsg('');
    setIsOnboard(false);

    fetchRealRoute(startPos, defaultDest);
  }, [selectedRide?.id, selectionTrigger, fetchRealRoute, selectedRide?.origin, selectedRide?.actualDropOffName]);

  // Auto-detect real device location on mount so it uses real GPS instead of hardcoded Rangsit
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const realPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          localStorage.setItem(
            'campushop_user_gps',
            JSON.stringify({ lat: realPos[0], lon: realPos[1], name: 'ตำแหน่ง GPS ของคุณ' })
          );
          setUserCurrentPos(realPos);
          setUserLocationName('ตำแหน่ง GPS ของคุณ');
          setCustomPickupPos(realPos);
          setCustomPickupName('ตำแหน่ง GPS ของคุณ');
          setPickupWalkMeters(0);
          setIsPickupOutOfRange(false);
          setPickupAlertMsg('');
          fetchRealRoute(realPos, destinationPos);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(realPos, 16, { duration: 1 });
          }
        },
        (err) => {
          console.log('Auto GPS lookup note:', err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, [destinationPos, fetchRealRoute]);

  const hasArrived = selectedProgress >= 1.0;
  const isApproachingPickup = selectedProgress < pickupRatio && !hasArrived;

  // Real-time distance and ETA countdowns:
  // 1) While approaching pickup -> countdown distance & time until driver arrives at pickup!
  // 2) Once onboard -> countdown distance & time until reaching destination!
  const distanceRemainingMeters = hasArrived
    ? 0
    : isApproachingPickup
    ? Math.max(0, Math.round(approachMeters * (1 - selectedProgress / pickupRatio)))
    : Math.max(0, Math.round(tripMeters * (1 - (selectedProgress - pickupRatio) / (1 - pickupRatio))));

  const secondsRemaining = hasArrived
    ? 0
    : isApproachingPickup
    ? Math.max(0, Math.round((approachMeters * (1 - selectedProgress / pickupRatio)) / 7.78))
    : Math.max(0, Math.round((tripMeters * (1 - (selectedProgress - pickupRatio) / (1 - pickupRatio))) / 7.78));

  const etaLabel = useMemo(() => {
    if (hasArrived) return lang === 'en' ? 'Arrived at Destination 🏁' : 'ถึงที่หมายแล้ว 🏁';
    if (isApproachingPickup) {
      if (secondsRemaining <= 15) return lang === 'en' ? 'Arriving at pickup 📍' : 'กำลังจะถึงจุดรับ 📍';
      const mins = Math.ceil(secondsRemaining / 60);
      return lang === 'en' ? `~${mins} min to you` : `อีก ~${mins} นาทีถึงคุณ`;
    }
    if (secondsRemaining <= 25) return lang === 'en' ? 'Arriving at destination 🏁' : 'กำลังจะถึงที่หมาย 🏁';
    const mins = Math.ceil(secondsRemaining / 60);
    return lang === 'en' ? `~${mins} min to destination` : `อีก ~${mins} นาทีถึงที่หมาย`;
  }, [hasArrived, isApproachingPickup, secondsRemaining, lang]);

  // Auto-detect when car reaches pickup point: Automatically board passenger and merge pins!
  useEffect(() => {
    if (!canShowDriverLocation) return;
    if (selectedProgress >= pickupRatio && !isOnboard && !hasArrived) {
      setIsOnboard(true);
      setBoardingToast(
        lang === 'en'
          ? '🚗 Driver has arrived! You are onboard (pin merged with vehicle)'
          : '🚗 รถมาถึงจุดรับแล้ว! คุณขึ้นรถเรียบร้อย (หมุดรวมเข้ากับรถอัตโนมัติ)'
      );
      const timer = setTimeout(() => {
        setBoardingToast('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedProgress, pickupRatio, isOnboard, hasArrived, lang, canShowDriverLocation]);

  // Initialize Map with Google Maps Street Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [14.0695, 100.608],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    // Real Google Maps Street Tiles (Official Google Maps Tiles Server)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    landmarksLayerRef.current = L.layerGroup().addTo(map);
    vehiclesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Automatic container resize observer to keep Leaflet tiles crisp on any viewport change
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {
          // ignore
        }
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current && mapContainerRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {
          // ignore
        }
      }
    }, 250);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync prop changes into local state
  useEffect(() => {
    if (propDestinationName && propDestinationName !== destinationName) {
      setDestinationName(propDestinationName);
    }
  }, [propDestinationName]);

  useEffect(() => {
    if (
      propDestinationPos &&
      (propDestinationPos[0] !== destinationPos[0] || propDestinationPos[1] !== destinationPos[1])
    ) {
      setDestinationPos(propDestinationPos);
      fetchRealRoute(customPickupPos, propDestinationPos);
    }
  }, [propDestinationPos, customPickupPos, fetchRealRoute]);

  // Click on map to adjust Pickup point (Destination is strictly locked to driver's destination)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // REQUIREMENT: If trip is booked, cannot move or change pin until trip is cancelled or ends!
      if (isBooked) {
        setPickupAlertMsg(
          lang === 'en'
            ? '🔒 Cannot change destination or pickup while trip is booked.'
            : '🔒 กำลังอยู่ระหว่างเดินทาง จุดรับ-ส่งถูกล็อคตามทริปที่จอง (ไม่สามารถย้ายหมุดได้จนกว่าจะจบทริปหรือยกเลิก)'
        );
        return;
      }

      const clickPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      const walkDist = calculateDistanceMeters(userCurrentPos, clickPos);

      if (walkDist > MAX_PICKUP_WALK_METERS) {
        setPickupAlertMsg(
          lang === 'en'
            ? `📍 Destination is locked to driver. You can only adjust pickup near your location (≤ ${MAX_PICKUP_WALK_METERS}m).`
            : `📍 จุดหมายปลายทางถูกกำหนดตามคนขับ คุณสามารถขยับเฉพาะจุดรับใกล้คุณ (ไม่เกิน ${MAX_PICKUP_WALK_METERS} ม.)`
        );
        return;
      }

      setPickupAlertMsg('');
      setIsPickupOutOfRange(false);
      setCustomPickupPos(clickPos);
      setCustomPickupName(
        walkDist <= 15
          ? (lang === 'en' ? `${userLocationDisplay} (Your Location)` : `${userLocationDisplay} (ตำแหน่งที่คุณอยู่)`)
          : (lang === 'en' ? `Pickup spot (Walk ${walkDist}m)` : `จุดรับใกล้คุณ (เดิน ${walkDist}m)`)
      );
      setPickupWalkMeters(walkDist);
      fetchRealRoute(clickPos, destinationPos);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [customPickupPos, destinationPos, userCurrentPos, userLocationDisplay, fetchRealRoute, lang, isBooked]);

  // Real-Time GPS Movement Tick: Moves car along the recalculated real Google Maps route
  useEffect(() => {
    if (!isSimulating || hasArrived || !canShowDriverLocation) {
      return;
    }

    const intervalMs = 1000;
    const stepRatio = (1 / Math.max(50, totalTripSeconds)) * speedMultiplier;

    const interval = setInterval(() => {
      setSelectedProgress((prev) => {
        const next = prev + stepRatio;
        if (next >= 1.0) {
          return 1.0; // Clean stop at destination
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulating, hasArrived, totalTripSeconds, speedMultiplier, canShowDriverLocation]);

  // Draw Polylines & Interactive Pins (Recalculated in real-time)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const landmarks = landmarksLayerRef.current;
    if (!map || !landmarks || activeRoute.length < 2) return;

    landmarks.clearLayers();
    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
    if (glowLayerRef.current) map.removeLayer(glowLayerRef.current);
    if (approachLayerRef.current) map.removeLayer(approachLayerRef.current);

    // Glowing route background for the direct trip (strictly pickup to destination)
    glowLayerRef.current = L.polyline(activeRoute as L.LatLngExpression[], {
      color: '#fb923c',
      weight: 10,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Sharp route polyline following the exact street turns to the chosen destination
    routeLayerRef.current = L.polyline(activeRoute as L.LatLngExpression[], {
      color: '#ea580c',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // When booked and driver is approaching, render driver's approach route as a distinct dashed blue line!
    if (canShowDriverLocation && isBooked && !isOnboard && approachRoute.length > 1) {
      approachLayerRef.current = L.polyline(approachRoute as L.LatLngExpression[], {
        color: '#2563eb',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // 0. User's Current Location Pin & Allowed Radius (ตำแหน่งปัจจุบันของคุณ - Where you are currently at)
    if (!isOnboard) {
      const userPinLabel = lang === 'en' ? `🧍‍♂️ You are here (${userLocationName})` : `🧍‍♂️ คุณอยู่ที่นี่ (${userLocationName})`;
      const userIcon = L.divIcon({
        className: 'user-current-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%); pointer-events:auto;">
            <div style="background:#1d4ed8; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; box-shadow:0 3px 8px rgba(29,78,216,0.4); border:1.5px solid #fff; white-space:nowrap; margin-bottom:3px;">
              ${userPinLabel}
            </div>
            <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">
              <span style="position:absolute; inset:0; border-radius:50%; background:rgba(29,78,216,0.35); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
              <div style="position:relative; width:14px; height:14px; border-radius:50%; background:#1d4ed8; border:2.5px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      L.marker(userCurrentPos as L.LatLngExpression, {
        icon: userIcon,
        zIndexOffset: 1500,
      }).addTo(landmarks);

      // Allowed Walking Radius Circle (จุดรับต้องอยู่ใกล้คุณ ไม่เกิน 300 เมตร)
      L.circle(userCurrentPos as L.LatLngExpression, {
        radius: MAX_PICKUP_WALK_METERS,
        color: '#2563eb',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
      }).addTo(landmarks);

      // Dotted walking guideline between user and pickup point
      if (pickupWalkMeters > 15) {
        L.polyline([userCurrentPos, customPickupPos] as L.LatLngExpression[], {
          color: '#2563eb',
          weight: 2,
          dashArray: '4, 4',
          opacity: 0.85,
        }).addTo(landmarks);
      }
    }

    // 1. Movable Pickup Pin (Must be at or near current location)
    if (!isOnboard) {
      const isRightAtUser = pickupWalkMeters <= 15;
      const pickupPinText = isBooked
        ? (lang === 'en' ? '📍 Pickup Point (Locked)' : '📍 จุดรับของทริปนี้ (ล็อค)')
        : (lang === 'en'
            ? (isRightAtUser ? '📍 Pickup: At your location (0m)' : `📍 Pickup: Walk ${pickupWalkMeters}m from you`)
            : (isRightAtUser ? '📍 จุดรับ: อยู่ที่เดียวกับคุณ (0m)' : `📍 จุดรับ: เดิน ${pickupWalkMeters}m จากคุณ`));
      const pickupIcon = L.divIcon({
        className: 'draggable-pickup-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%); pointer-events:auto; cursor:${isBooked ? 'default' : 'grab'};">
            <div style="background:${isPickupOutOfRange ? '#dc2626' : isBooked ? '#059669' : '#0284c7'}; color:#fff; font-size:10px; font-weight:800; padding:3px 9px; border-radius:999px; box-shadow:0 3px 8px rgba(0,0,0,0.3); border:1.5px solid #fff; white-space:nowrap; margin-bottom:4px;">
              ${pickupPinText}
            </div>
            <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
              <span style="position:absolute; inset:0; border-radius:50%; background:${
                isPickupOutOfRange ? 'rgba(220,38,38,0.4)' : isBooked ? 'rgba(5,150,105,0.4)' : 'rgba(2,132,199,0.4)'
              }; animation:ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="position:relative; width:20px; height:20px; border-radius:50%; background:${
                isPickupOutOfRange ? '#dc2626' : isBooked ? '#059669' : '#0284c7'
              }; border:3px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const pMarker = L.marker(customPickupPos as L.LatLngExpression, {
        icon: pickupIcon,
        draggable: !isBooked,
      }).addTo(landmarks);

      pMarker.on('dragend', (e) => {
        if (isBooked) return;
        const newLatLng = e.target.getLatLng();
        const newPos: [number, number] = [newLatLng.lat, newLatLng.lng];
        const walkDist = calculateDistanceMeters(userCurrentPos, newPos);

        // Guardrail: Pickup point should NOT be too far from where you currently are!
        if (walkDist > MAX_PICKUP_WALK_METERS) {
          setPickupAlertMsg(
            lang === 'en'
              ? `⚠️ Pickup is too far (${walkDist}m > max ${MAX_PICKUP_WALK_METERS}m)! Resetting to your location.`
              : `⚠️ จุดรับอยู่ไกลเกินไป (${walkDist}m > สูงสุด ${MAX_PICKUP_WALK_METERS}m)! จุดรับต้องอยู่ใกล้ตำแหน่งที่คุณอยู่ หมุดถูกดึงกลับมาที่ตำแหน่งคุณแล้ว`
          );
          setIsPickupOutOfRange(false);
          setCustomPickupPos(userCurrentPos);
          setCustomPickupName(lang === 'en' ? `${userLocationDisplay} (Your Location)` : `${userLocationDisplay} (ตำแหน่งที่คุณอยู่)`);
          setPickupWalkMeters(0);
          pMarker.setLatLng(userCurrentPos as L.LatLngExpression);
          fetchRealRoute(userCurrentPos, destinationPos);
          return;
        }

        setPickupAlertMsg('');
        setIsPickupOutOfRange(false);
        setCustomPickupPos(newPos);
        setCustomPickupName(
          walkDist <= 15
            ? (lang === 'en' ? `${userLocationDisplay} (Your Location)` : `${userLocationDisplay} (ตำแหน่งที่คุณอยู่)`)
            : (lang === 'en' ? `Pickup spot (Walk ${walkDist}m)` : `จุดรับใกล้คุณ (เดิน ${walkDist}m)`)
        );
        setPickupWalkMeters(walkDist);
        fetchRealRoute(newPos, destinationPos);
      });

      pickupMarkerRef.current = pMarker;
    }

    // 2. Locked Destination Pin (Strictly matched with driver's destination)
    const destPinLabel = lang === 'en'
      ? `🏁 Destination: ${destinationName}`
      : `🏁 จุดหมายปลายทาง: ${destinationName}`;
    const destIcon = L.divIcon({
      className: 'destination-pin',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%); pointer-events:auto; cursor:default;">
          <div style="background:#047857; color:#fff; font-size:10px; font-weight:800; padding:3px 9px; border-radius:999px; box-shadow:0 3px 8px rgba(4,120,87,0.4); border:1.5px solid #fff; white-space:nowrap; margin-bottom:4px;">
            ${destPinLabel}
          </div>
          <div style="width:28px; height:28px; border-radius:50%; background:#059669; border:2.5px solid #fff; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.4);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const dMarker = L.marker(destinationPos as L.LatLngExpression, {
      icon: destIcon,
      draggable: false,
    }).addTo(landmarks);

    destMarkerRef.current = dMarker;
  }, [activeRoute, customPickupPos, customPickupName, destinationPos, destinationName, pickupWalkMeters, isPickupOutOfRange, isOnboard, userCurrentPos, userLocationDisplay, fetchRealRoute, lang, isBooked]);

  // Render Vehicles: Follows exact recalculated road path from custom pickup to chosen destination
  useEffect(() => {
    const vehiclesLayer = vehiclesLayerRef.current;
    if (!vehiclesLayer) return;

    vehiclesLayer.clearLayers();

    // Spec: "for ดูเเผนที่ it should not show where the driver is until you select who the driver after you select the driver/or book the driver you will see it/ prebook not see yet tho until reach the day"
    if (!canShowDriverLocation || !selectedRide) {
      return;
    }

    // Driver View: Driver only sees the route and meeting point!
    if (viewRole === 'driver') {
      return;
    }

    // Passenger View: Show ONLY the booked car (Spec: ผู้โดยสารไม่ควรเห็นรถคันอื่น นอกจากของตัวเอง)
    let carPos: [number, number];
    if (isApproachingPickup) {
      const approachProg = Math.min(1.0, selectedProgress / pickupRatio);
      const res = getCoordinateAlongRoute(
        approachRoute.length > 1 ? approachRoute : [getDriverStartPos(customPickupPos), customPickupPos],
        approachProg
      );
      carPos = res.pos;
    } else {
      const tripProg = Math.min(1.0, (selectedProgress - pickupRatio) / (1 - pickupRatio));
      const res = getCoordinateAlongRoute(activeRoute, tripProg);
      carPos = res.pos;
    }
    const rideNet = selectedRide.baseFare + (isPremium ? 0 : selectedRide.commissionFee);

    const badgeText = hasArrived
      ? (lang === 'en' ? `🏁 Arrived (${selectedRide.hostName})` : `🏁 ถึงจุดหมายปลายทางแล้ว (${selectedRide.hostName})`)
      : isApproachingPickup
      ? (lang === 'en' ? `🚗 ${selectedRide.hostName} • Heading to pickup (${distanceRemainingMeters}m)` : `🚗 ${selectedRide.hostName} • กำลังขับมารับคุณ (${distanceRemainingMeters}m)`)
      : isOnboard
      ? (lang === 'en' ? `🚗 ${selectedRide.hostName} + You (Onboard)` : `🚗 ${selectedRide.hostName} + คุณ (อยู่บนรถด้วยกัน)`)
      : (lang === 'en' ? `🚗 ${selectedRide.hostName} • ฿${rideNet} (En route)` : `🚗 ${selectedRide.hostName} • ฿${rideNet} (กำลังเดินทาง)`);

    const badgeBg = hasArrived
      ? '#059669' // Green when arrived
      : isApproachingPickup
      ? '#ea580c' // Orange when driving to pickup
      : isOnboard
      ? '#2563eb' // Blue when passenger is onboard with driver
      : '#ea580c'; // Orange while en-route

    const carIcon = L.divIcon({
      className: `selected-driver-car-marker`,
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%); cursor:pointer;">
          <div style="background:${badgeBg}; color:#fff; font-size:11px; font-weight:900; padding:3px 10px; border-radius:999px; box-shadow:0 3px 10px rgba(0,0,0,0.35); white-space:nowrap; margin-bottom:3px; border:2px solid #fff;">
            ${badgeText}
          </div>
          <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
            ${
              !hasArrived
                ? `<span style="position:absolute; inset:0; border-radius:50%; background:${badgeBg}; opacity:0.4; animation:ping 1.3s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                : ''
            }
            <div style="position:relative; width:34px; height:34px; border-radius:50%; background:${badgeBg}; border:2.5px solid #fff; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.35);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H7.5a1 1 0 0 0-.8.4L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3m14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const marker = L.marker(carPos, {
      icon: carIcon,
      zIndexOffset: 3000,
    }).addTo(vehiclesLayer);

    marker.on('click', () => {
      onSelectRide(selectedRide.id);
    });
  }, [viewRole, selectedRide, canShowDriverLocation, activeRoute, approachRoute, selectedProgress, isOnboard, hasArrived, isPremium, onSelectRide, isApproachingPickup, pickupRatio, customPickupPos, getDriverStartPos]);

  // Recenter map viewport to active route or markers
  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (routeLayerRef.current && activeRoute.length >= 2) {
      map.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
    } else if (customPickupPos && destinationPos) {
      const bounds = L.latLngBounds([customPickupPos, destinationPos]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [activeRoute, customPickupPos, destinationPos]);

  // React to recenterTrigger from parent header (e.g. 🎯 button)
  useEffect(() => {
    if (recenterTrigger && recenterTrigger > 0) {
      handleRecenter();
    }
  }, [recenterTrigger, handleRecenter]);

  // Spec: Auto-finish trip when arriving at destination GPS location
  useEffect(() => {
    if (!hasArrived) {
      hasAutoFinishedRef.current = false;
    } else if (isBooked && onRequestFinishTrip && !hasAutoFinishedRef.current) {
      hasAutoFinishedRef.current = true;
      const timer = setTimeout(() => {
        onRequestFinishTrip();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [hasArrived, isBooked, onRequestFinishTrip]);

  const progressPercent = Math.min(100, Math.round(selectedProgress * 100));

  return (
    <div
      className={`relative border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-slate-100 ${className}`}
    >
      {/* Alerts and Boarding Toast */}
      {pickupAlertMsg && (
        <div className="absolute top-3 left-3 right-14 z-[1000] bg-rose-600 text-white text-[10px] font-black p-2.5 rounded-xl shadow-lg flex items-center justify-between pointer-events-auto">
          <span>{pickupAlertMsg}</span>
          <button type="button" onClick={() => setPickupAlertMsg('')} className="ml-2 font-bold opacity-80 hover:opacity-100">✕</button>
        </div>
      )}
      {boardingToast && !pickupAlertMsg && (
        <div className="absolute top-3 left-3 right-14 z-[1000] bg-blue-600 text-white text-[10px] font-black p-2.5 rounded-xl shadow-lg pointer-events-auto">
          {boardingToast}
        </div>
      )}

      {/* Real Interactive Leaflet Map with Google Maps Tiles */}
      <div
        ref={mapContainerRef}
        className="w-full flex-1 z-0 min-h-[220px]"
        style={{ height: '100%', minHeight: '220px' }}
      />

      {/* Floating Navigation Telemetry HUD or Pre-Book / Route Preview HUD */}
      {isModalOpen ? null : isBooked ? (
        isPrebook && !simulatedPrebookDayReached ? (
          /* Pre-Book Scheduled HUD (Spec: prebook not see yet tho until reach the day) */
          <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-amber-300 rounded-2xl p-3 shadow-xl space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-sm shrink-0">
                  📅
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate flex items-center gap-1.5">
                    <span>{selectedRide?.hostName} ({selectedRide?.vehicleLabel?.split('•')[0]?.trim() || 'รถยนต์'})</span>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-300">
                      {lang === 'en' ? 'Pre-Book' : 'จองล่วงหน้า'}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-700 truncate">
                    {selectedRide?.scheduleLabel || (lang === 'en' ? 'Departing on schedule' : 'นัดหมายการเดินทาง')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSimulatedPrebookDayReached(true)}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-[10px] rounded-xl transition shrink-0 whitespace-nowrap shadow-sm"
              >
                {lang === 'en' ? '⚡ Simulate Day Reached' : '⚡ จำลอง: ถึงวันเดินทาง'}
              </button>
            </div>

            <div className="text-[10px] text-slate-600 bg-amber-50/70 p-2 rounded-xl border border-amber-200/80 flex items-center gap-1.5">
              <span>🔒</span>
              <span>
                {lang === 'en'
                  ? 'Scheduled ride: Driver live location is hidden until departure day/time.'
                  : 'ทริปจองล่วงหน้า: ไม่แสดงตำแหน่งรถคนขับจนกว่าจะถึงวันและเวลาออกเดินทางจริง'}
              </span>
            </div>
          </div>
        ) : !isHudExpanded ? (
          /* Mini Collapsible 1-Line HUD (Friend spec: ย่อเหลือบรรทัดเดียวไม่บังแผนที่) */
          <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3 py-2 shadow-lg flex items-center justify-between gap-2 pointer-events-auto">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  hasArrived
                    ? 'bg-emerald-500'
                    : isOnboard
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-orange-500 animate-pulse'
                }`}
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">
                  {selectedRide?.hostName} ({selectedRide?.vehicleLabel?.split('•')[0]?.trim() || 'รถยนต์'})
                </div>
                <div className="text-[10px] font-bold text-slate-500 truncate">
                  {hasArrived
                    ? (lang === 'en' ? '🏁 Arrived / 0 m (Completed)' : '🏁 ถึงที่หมายแล้ว / 0 m (ส่งเรียบร้อย)')
                    : isApproachingPickup
                    ? (lang === 'en' ? `🚗 Picking you up (${distanceRemainingMeters}m)` : `🚗 คนขับกำลังมารับ (${distanceRemainingMeters}m)`)
                    : (lang === 'en' ? `🚗 To ${destinationName} (${etaLabel})` : `🚗 มุ่งหน้า ${destinationName} (${etaLabel})`)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isPrebook && (
                <button
                  type="button"
                  onClick={() => setSimulatedPrebookDayReached(false)}
                  className="px-2 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg text-[9px] font-black border border-amber-300 transition"
                  title="ย้อนกลับไปก่อนวันเดินทาง"
                >
                  {lang === 'en' ? 'Pre-Day' : 'ก่อนวันเดินทาง'}
                </button>
              )}
              {hasArrived && onRequestFinishTrip && (
                <button
                  type="button"
                  onClick={onRequestFinishTrip}
                  className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] shadow-sm transition active:scale-95"
                >
                  {lang === 'en' ? '✓ Finish' : '✓ จบทริป'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsHudExpanded(true)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black flex items-center gap-0.5 transition"
                title={lang === 'en' ? 'Expand details' : 'ขยายข้อมูลการเดินทาง'}
              >
                <span>▲</span>
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Full Telemetry HUD */
          <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-xl space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    hasArrived
                      ? 'bg-emerald-500'
                      : isOnboard
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-orange-500 animate-pulse'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate flex items-center gap-1.5">
                    <span>{selectedRide?.hostName} ({selectedRide?.vehicleLabel?.split('•')[0]?.trim() || 'รถยนต์'})</span>
                    {viewRole === 'driver' && (
                      <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.2 rounded">
                        {lang === 'en' ? 'Driver View' : 'มุมมองคนขับ'}
                      </span>
                    )}
                    {isPrebook && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded border border-amber-300">
                        {lang === 'en' ? 'Pre-Book' : 'จองล่วงหน้า'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 truncate">
                    {viewRole === 'driver'
                      ? (lang === 'en' ? `📍 Pickup spot: ${customPickupDisplay}` : `📍 จุดนัดรับ: ${customPickupDisplay}`)
                      : isApproachingPickup
                      ? (lang === 'en' ? `🚗 Driver is heading to pick you up at 📍 ${customPickupDisplay}` : `🚗 คนขับกำลังเดินทางมารับคุณที่ 📍 ${customPickupDisplay}`)
                      : (lang === 'en' ? `📍 From ${customPickupDisplay} ➔ 🏁 ${destinationName}` : `📍 จาก ${customPickupDisplay} ➔ 🏁 ${destinationName}`)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div
                    className={`text-xs font-black font-mono ${
                      hasArrived
                        ? 'text-emerald-700'
                        : isApproachingPickup
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {etaLabel}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 font-mono">
                    {hasArrived
                      ? (lang === 'en' ? '0 m (Completed)' : '0 m (ส่งเรียบร้อย)')
                      : isApproachingPickup
                      ? (lang === 'en' ? `${distanceRemainingMeters} m to you` : `เหลือ ${distanceRemainingMeters} m ถึงคุณ`)
                      : distanceRemainingMeters >= 1000
                      ? (lang === 'en' ? `${(distanceRemainingMeters / 1000).toFixed(2)} km left` : `เหลือ ${(distanceRemainingMeters / 1000).toFixed(2)} km`)
                      : (lang === 'en' ? `${distanceRemainingMeters} m left` : `เหลือ ${distanceRemainingMeters} m`)}
                  </div>
                </div>

                {isPrebook && (
                  <button
                    type="button"
                    onClick={() => setSimulatedPrebookDayReached(false)}
                    className="px-2 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg text-[9px] font-black border border-amber-300 transition"
                    title="ย้อนกลับไปก่อนวันเดินทาง"
                  >
                    {lang === 'en' ? 'Pre-Day' : 'ก่อนวันเดินทาง'}
                  </button>
                )}

                {hasArrived && onRequestFinishTrip && (
                  <button
                    type="button"
                    onClick={onRequestFinishTrip}
                    className="min-h-[28px] px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] shadow-sm transition active:scale-95 animate-bounce"
                  >
                    <span>{lang === 'en' ? '✓ Finish' : '✓ จบทริป'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsHudExpanded(false)}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black transition self-start"
                  title={lang === 'en' ? 'Collapse' : 'ย่อ'}
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Animated Trip Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  hasArrived
                    ? 'bg-emerald-500'
                    : isOnboard
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )
      ) : selectedRide ? (
        /* Route Preview Bottom Pill (Driver is hidden until booked / chosen) */
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-orange-200 rounded-2xl p-3 shadow-lg flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-sm font-bold shrink-0">
              🔒
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-800 truncate">
                {lang === 'en'
                  ? `Route Preview • ${selectedRide.hostName}`
                  : `ดูเส้นทาง • ${selectedRide.hostName}`}
              </div>
              <div className="text-[10px] font-bold text-slate-500 truncate">
                {lang === 'en'
                  ? "Driver's live location is hidden until you select/book driver"
                  : 'ตำแหน่งรถคนขับจะแสดงเมื่อคุณเลือกคนขับ/จองที่นั่ง'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectRide(selectedRide.id)}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-xs transition shrink-0 whitespace-nowrap"
          >
            {lang === 'en' ? 'Select Driver →' : 'เลือกคนขับนี้ →'}
          </button>
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 shadow-lg flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-800 truncate">
                {lang === 'en'
                  ? 'Choose a driver from Home to view route'
                  : 'เลือกคนขับจากหน้าหลักเพื่อดูเส้นทาง'}
              </div>
              <div className="text-[10px] font-bold text-slate-500 truncate">
                {customPickupDisplay} → {destinationName}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
            {totalTripMeters >= 1000 ? `${(totalTripMeters / 1000).toFixed(2)} km` : `${totalTripMeters} m`}
          </span>
        </div>
      )}
    </div>
  );
};
