// Universal Geocoding & Campus Landmarks Utility
// Allows real-world geocoding search across Thailand (like Google Maps) using Nominatim & Photon

export interface GeocodePlace {
  name: string;
  desc: string;
  lat: number;
  lon: number;
  isOnline?: boolean;
}

export const QUICK_LANDMARKS: { name: string; lat: number; lon: number; desc: string }[] = [
  { name: 'คอนโด B', lat: 14.0668, lon: 100.6105, desc: 'ประตูเชียงราก 2' },
  { name: 'Kave TU', lat: 14.0664, lon: 100.6095, desc: 'ตรงข้ามประตูเชียงราก' },
  { name: 'Kave TU Condo', lat: 14.0664, lon: 100.6095, desc: 'ตรงข้ามประตูเชียงราก' },
  { name: 'คอนโด B (เชียงราก 2)', lat: 14.0668, lon: 100.6105, desc: 'ประตูเชียงราก 2' },
  { name: 'TU Dome', lat: 14.0628, lon: 100.5975, desc: 'ประตูเชียงราก 1' },
  { name: 'TU Dome Residential', lat: 14.0628, lon: 100.5975, desc: 'ประตูเชียงราก 1' },
  { name: 'SIIT บางกระดี่', lat: 13.9954, lon: 100.6018, desc: 'วิทยาเขตบางกระดี่ ปทุมธานี' },
  { name: 'SIIT รังสิต', lat: 14.0722, lon: 100.6053, desc: 'ลานจอดรถหน้าสถาบัน SIIT' },
  { name: 'Future Park รังสิต', lat: 13.9892, lon: 100.6177, desc: 'ห้างฟิวเจอร์พาร์ค' },
  { name: 'ยิม 7', lat: 14.0755, lon: 100.6072, desc: 'ศูนย์กีฬา TU Sport Complex ยิม 7' },
  { name: 'Dcondo Campus', lat: 14.0658, lon: 100.6158, desc: 'คลองหลวง คอนโด' },
  { name: 'อาคารเรียนรวม SC', lat: 14.0702, lon: 100.6092, desc: 'หน้าตึก SC ป้ายรถ NGV' },
  { name: 'อุทยานการเรียนรู้ป๋วย', lat: 14.0710, lon: 100.6101, desc: 'Puey Park ทางเข้าฝั่งทิศใต้' },
  { name: 'Inter Zone (ศูนย์อาหาร)', lat: 14.0735, lon: 100.6082, desc: 'ลานหน้าอินเตอร์โซน' },
  { name: 'หอพักใน มธ. (เอเชียนเกมส์)', lat: 14.0728, lon: 100.6025, desc: 'โซนหอพักนักศึกษา' },
];

export function getLandmarkCoords(name: string): [number, number] {
  if (!name) return [14.0668, 100.6105];
  const clean = name.trim().toLowerCase();
  const matched = QUICK_LANDMARKS.find(
    (lm) =>
      lm.name.toLowerCase() === clean ||
      clean.includes(lm.name.toLowerCase()) ||
      lm.name.toLowerCase().includes(clean)
  );
  if (matched) return [matched.lat, matched.lon];
  if (clean.includes('kave') || clean.includes('คอนโด b') || clean.includes('condo b')) {
    return [14.0668, 100.6105];
  }
  if (clean.includes('บางกระดี่') || clean.includes('bangkadi')) {
    return [13.9954, 100.6018];
  }
  if (clean.includes('tu dome') || clean.includes('ทูดอม')) {
    return [14.0628, 100.5975];
  }
  if (clean.includes('future') || clean.includes('ฟิวเจอร์')) {
    return [13.9892, 100.6177];
  }
  if (clean.includes('ยิม 7') || clean.includes('gym 7')) {
    return [14.0755, 100.6072];
  }
  return [14.0668, 100.6105];
}

export function findNearestLandmark(
  pos: [number, number]
): typeof QUICK_LANDMARKS[0] | null {
  for (const lm of QUICK_LANDMARKS) {
    const dLat = (lm.lat - pos[0]) * 111000;
    const dLon = (lm.lon - pos[1]) * 111000 * Math.cos((pos[0] * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist <= 250) {
      return lm;
    }
  }
  return null;
}

export function calculateDistanceMeters(
  a: [number, number],
  b: [number, number]
): number {
  const dLat = (b[0] - a[0]) * 111000;
  const dLon = (b[1] - a[1]) * 111000 * Math.cos((a[0] * Math.PI) / 180);
  return Math.round(Math.sqrt(dLat * dLat + dLon * dLon));
}

// Search ANY place across Thailand using OpenStreetMap Nominatim + Photon fallback
export async function searchAnyPlace(
  query: string,
  signal?: AbortSignal
): Promise<GeocodePlace[]> {
  const clean = query.trim();
  if (!clean) return [];

  // 1. Immediate local landmark matches
  const localMatches: GeocodePlace[] = QUICK_LANDMARKS.filter(
    (lm) =>
      lm.name.toLowerCase().includes(clean.toLowerCase()) ||
      lm.desc.toLowerCase().includes(clean.toLowerCase())
  ).map((lm) => ({
    name: lm.name,
    desc: lm.desc,
    lat: lm.lat,
    lon: lm.lon,
    isOnline: false,
  }));

  // If very short query (< 2 chars), just return local matches
  if (clean.length < 2) {
    return localMatches;
  }

  // 2. Query Nominatim OpenStreetMap Geocoder (focused on Thailand)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      clean
    )}&countrycodes=th&limit=7&addressdetails=1`;
    const res = await fetch(nomUrl, {
      signal,
      headers: {
        'Accept-Language': 'th,en',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const onlineResults: GeocodePlace[] = data.map((item: any) => {
          const parts = (item.display_name || '')
            .split(',')
            .map((s: string) => s.trim());
          const primaryName = item.name || parts[0] || clean;
          const addressDesc = parts.slice(1, 4).join(', ') || item.display_name;
          return {
            name: primaryName,
            desc: addressDesc,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            isOnline: true,
          };
        });

        // Merge results avoiding duplicate coordinates
        const combined = [...localMatches];
        for (const item of onlineResults) {
          const exists = combined.some(
            (c) =>
              c.name.toLowerCase() === item.name.toLowerCase() ||
              (Math.abs(c.lat - item.lat) < 0.0008 &&
                Math.abs(c.lon - item.lon) < 0.0008)
          );
          if (!exists) {
            combined.push(item);
          }
        }
        return combined;
      }
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      // Nominatim timed out or failed, try Photon next
    }
  }

  // 3. Fallback: Query Photon (Komoot OSM Geocoder, tolerant to Rangsit & Thai queries)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      clean
    )}&limit=7&lat=14.07&lon=100.60`;
    const res = await fetch(photonUrl, { signal });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const photonResults: GeocodePlace[] = data.features.map((feat: any) => {
          const p = feat.properties || {};
          const coords = feat.geometry?.coordinates || [100.6, 14.07];
          const name = p.name || p.street || clean;
          const desc = [p.district, p.city, p.country].filter(Boolean).join(', ');
          return {
            name,
            desc: desc || 'Thailand',
            lat: coords[1],
            lon: coords[0],
            isOnline: true,
          };
        });

        const combined = [...localMatches];
        for (const item of photonResults) {
          const exists = combined.some(
            (c) =>
              c.name.toLowerCase() === item.name.toLowerCase() ||
              (Math.abs(c.lat - item.lat) < 0.0008 &&
                Math.abs(c.lon - item.lon) < 0.0008)
          );
          if (!exists) combined.push(item);
        }
        return combined;
      }
    }
  } catch {
    // ignore
  }

  return localMatches;
}
