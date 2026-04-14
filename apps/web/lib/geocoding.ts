/**
 * Geocoding helper using OpenStreetMap Nominatim.
 *
 * Free, no API key required. Rate-limited to ~1 req/sec, and the usage
 * policy requires a descriptive User-Agent header identifying the app.
 * Fine for MVP volumes. Swap for Google/Mapbox later if we need higher
 * throughput or better accuracy.
 *
 * https://nominatim.org/release-docs/latest/api/Search/
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  display_name: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

export async function geocodeAddress(params: {
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}): Promise<GeocodeResult | null> {
  const query = [
    params.line1,
    params.city,
    params.state,
    params.postal_code,
    params.country,
  ]
    .filter(Boolean)
    .join(', ');

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Serva/0.1 (serva.app; contact@serva.app)',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.error(
        `Geocoding failed: ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const data = (await res.json()) as NominatimResponse[];
    if (data.length === 0) return null;

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
