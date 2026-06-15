const CARACAS_FALLBACK = { lat: 10.4806, lng: -66.9036 };

function getTextSeed(text) {
  return String(text)
    .split('')
    .reduce((acc, char, index) => (acc + char.charCodeAt(0) * (index + 11)) % 100000, 0);
}

function createFallbackCoords(address, city) {
  const seed = getTextSeed(`${address}|${city}`);
  const latOffset = ((seed % 240) - 120) / 10000;
  const lngOffset = (((seed * 3) % 320) - 160) / 10000;

  return {
    lat: CARACAS_FALLBACK.lat + latOffset,
    lng: CARACAS_FALLBACK.lng + lngOffset,
  };
}

/**
 * Geocodifica una dirección en texto usando Nominatim (OpenStreetMap).
 * Devuelve coordenadas aproximadas de Caracas si la búsqueda falla.
 */
export async function geocodeAddress(addressText, city = 'Caracas') {
  const address = addressText?.trim() ?? '';
  const normalizedCity = city?.trim() || 'Caracas';
  const query = [address, normalizedCity, 'Distrito Capital', 'Venezuela'].filter(Boolean).join(', ');

  if (!query.trim()) {
    return { ...CARACAS_FALLBACK, displayName: address };
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 've');
  url.searchParams.set('viewbox', '-67.12,10.58,-66.76,10.34');
  url.searchParams.set('bounded', '1');
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept-Language': 'es' },
    });

    if (!response.ok) {
      const fallback = createFallbackCoords(address, normalizedCity);
      return { ...fallback, displayName: address };
    }

    const results = await response.json();
    const first = Array.isArray(results) ? results[0] : null;

    if (!first?.lat || !first?.lon) {
      const fallback = createFallbackCoords(address, normalizedCity);
      return { ...fallback, displayName: address };
    }

    return {
      lat: Number(first.lat),
      lng: Number(first.lon),
      displayName: first.display_name || address,
    };
  } catch {
    const fallback = createFallbackCoords(address, normalizedCity);
    return { ...fallback, displayName: address };
  }
}
