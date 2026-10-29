/**
 * LifeOS Geolocation & Regional Culinary Mapping Service
 * Detects user coordinates, city, region, and assigns appropriate localized cuisine profiles.
 */

export interface UserLocationProfile {
  city: string;
  region: string;
  country: string;
  cuisineStyle: string;
  latitude?: number;
  longitude?: number;
  source: 'GPS' | 'IP' | 'TIMEZONE' | 'MANUAL';
  detectedAt: string;
}

export const SUPPORTED_CUISINE_STYLES = [
  { id: 'SOUTH_INDIAN', name: 'South Indian (Tamil Nadu / Coastal & Millets)', defaultRegion: 'Tamil Nadu', defaultCountry: 'India' },
  { id: 'NORTH_INDIAN', name: 'North Indian (Tandoor, Dals & Whole Wheat)', defaultRegion: 'Delhi / Punjab', defaultCountry: 'India' },
  { id: 'CONTINENTAL_AMERICAN', name: 'Continental & American Macro (Clean Whole Foods)', defaultRegion: 'California', defaultCountry: 'United States' },
  { id: 'MEDITERRANEAN', name: 'Mediterranean & European (Olive Oil, Greens & Seafood)', defaultRegion: 'Southern Europe', defaultCountry: 'Greece / Italy' },
  { id: 'EAST_ASIAN', name: 'East Asian (Lean Steamed Proteins, Tofu & Broths)', defaultRegion: 'Tokyo / Seoul', defaultCountry: 'Japan / Korea' },
  { id: 'MIDDLE_EASTERN', name: 'Middle Eastern (Shawarma Spices, Hummus & Grills)', defaultRegion: 'Dubai', defaultCountry: 'United Arab Emirates' },
  { id: 'GLOBAL_BALANCED', name: 'Global Balanced Contemporary', defaultRegion: 'International', defaultCountry: 'Global' },
];

/**
 * Infer culinary style and staple ingredients from detected country and region
 */
export function inferCuisineStyle(country: string, region: string): string {
  const normCountry = (country || '').toLowerCase();
  const normRegion = (region || '').toLowerCase();

  if (normCountry.includes('india')) {
    if (
      normRegion.includes('tamil') ||
      normRegion.includes('kerala') ||
      normRegion.includes('karnataka') ||
      normRegion.includes('andhra') ||
      normRegion.includes('telangana') ||
      normRegion.includes('chennai') ||
      normRegion.includes('bengaluru') ||
      normRegion.includes('bangalore') ||
      normRegion.includes('hyderabad') ||
      normRegion.includes('coimbatore') ||
      normRegion.includes('madurai')
    ) {
      return 'South Indian (Tamil Nadu / Coastal & Millets)';
    }
    return 'North Indian (Tandoor, Dals & Whole Wheat)';
  }

  if (normCountry.includes('united states') || normCountry.includes('usa') || normCountry.includes('canada')) {
    return 'Continental & American Macro (Clean Whole Foods)';
  }

  if (
    normCountry.includes('united kingdom') ||
    normCountry.includes('uk') ||
    normCountry.includes('germany') ||
    normCountry.includes('france') ||
    normCountry.includes('spain') ||
    normCountry.includes('italy') ||
    normCountry.includes('greece')
  ) {
    return 'Mediterranean & European (Olive Oil, Greens & Seafood)';
  }

  if (normCountry.includes('japan') || normCountry.includes('korea') || normCountry.includes('china') || normCountry.includes('taiwan')) {
    return 'East Asian (Lean Steamed Proteins, Tofu & Broths)';
  }

  if (normCountry.includes('emirates') || normCountry.includes('uae') || normCountry.includes('saudi') || normCountry.includes('qatar')) {
    return 'Middle Eastern (Shawarma Spices, Hummus & Grills)';
  }

  return 'South Indian (Tamil Nadu / Coastal & Millets)'; // Default standard
}

/**
 * Primary Geolocation Detection:
 * 1. Attempts GPS via navigator.geolocation with 4s timeout.
 * 2. Falls back to fast IP lookup (ipwho.is).
 * 3. Falls back to Intl.DateTimeFormat timezone mapping.
 */
export async function detectUserLocation(): Promise<UserLocationProfile> {
  const timestamp = new Date().toISOString();

  // 1. Try Browser GPS Geolocation
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 600000,
          enableHighAccuracy: false,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode via free OpenStreetMap Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
          { headers: { 'User-Agent': 'LifeOS-Command-Centre-Health/1.0' } }
        );
        if (res.ok) {
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.county ||
            'Chennai';
          const region = data.address?.state || 'Tamil Nadu';
          const country = data.address?.country || 'India';
          const cuisineStyle = inferCuisineStyle(country, region);

          return {
            city,
            region,
            country,
            cuisineStyle,
            latitude,
            longitude,
            source: 'GPS',
            detectedAt: timestamp,
          };
        }
      } catch (e) {
        console.warn('[LocationService] Nominatim reverse-geocode failed, falling back:', e);
      }
    } catch (_gpsError) {
      // GPS permission denied or timed out — silently fall back to IP/timezone profile
    }
  }

  // 2. Try fast IP-based Geolocation (ipwho.is)
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        const city = data.city || 'Chennai';
        const region = data.region || 'Tamil Nadu';
        const country = data.country || 'India';
        const cuisineStyle = inferCuisineStyle(country, region);

        return {
          city,
          region,
          country,
          cuisineStyle,
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'IP',
          detectedAt: timestamp,
        };
      }
    }
  } catch (_ipError) {
    // IP Geolocation unavailable — silently fall back to timezone profile
  }

  // 3. Timezone Fallback
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  let city = 'Chennai';
  let region = 'Tamil Nadu';
  let country = 'India';

  if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata')) {
    city = 'Chennai';
    region = 'Tamil Nadu';
    country = 'India';
  } else if (timeZone.includes('New_York') || timeZone.includes('Chicago') || timeZone.includes('Los_Angeles')) {
    city = 'New York';
    region = 'New York';
    country = 'United States';
  } else if (timeZone.includes('London')) {
    city = 'London';
    region = 'Greater London';
    country = 'United Kingdom';
  } else if (timeZone.includes('Dubai')) {
    city = 'Dubai';
    region = 'Dubai';
    country = 'United Arab Emirates';
  }

  return {
    city,
    region,
    country,
    cuisineStyle: inferCuisineStyle(country, region),
    source: 'TIMEZONE',
    detectedAt: timestamp,
  };
}
