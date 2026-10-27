/**
 * Utility untuk validasi format URL dan domain peta (maps) pada sistem.
 */

const URL_MAX_LENGTH = 2048;

/**
 * Mem-parse URL dengan protokol http / https secara ketat.
 * Mencegah bypass tanpa double slash seperti `https:www.domain.com`.
 */
export function parseHttpUrl(value: unknown): URL | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > URL_MAX_LENGTH) return null;
  if (!/^https?:\/\/\S+$/i.test(trimmed)) return null;

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname || !parsed.hostname.includes('.')) return null;
    if (parsed.hostname.startsWith('.') || parsed.hostname.endsWith('.')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Cek apakah string merupakan HTTP/HTTPS URL yang valid.
 */
export function isValidHttpUrl(value: unknown): boolean {
  return parseHttpUrl(value) !== null;
}

/**
 * Memeriksa apakah hostname URL berakhiran atau cocok dengan salah satu domain.
 */
function hostMatches(hostname: string, domain: string): boolean {
  const host = hostname.toLowerCase();
  const d = domain.toLowerCase();
  return host === d || host.endsWith('.' + d);
}

/**
 * Validasi apakah URL merupakan URL lokasi peta yang valid:
 * - Google Maps (maps.app.goo.gl, goo.gl/maps, maps.google, google/maps)
 * - OpenStreetMap (openstreetmap.org, osm.org)
 * - Waze (waze.com, ul.waze.com)
 * - Apple Maps (maps.apple.com)
 */
export function isMapsLocationUrl(value: unknown): boolean {
  const url = parseHttpUrl(value);
  if (!url) return false;

  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  // 1. Google Maps
  if (host === 'maps.app.goo.gl') return true;
  if (host === 'goo.gl' && path.startsWith('/maps')) return true;
  if (/^maps\.google\.[a-z.]+$/.test(host)) return true;
  if (/^(www\.)?google\.[a-z.]+$/.test(host) && path.startsWith('/maps')) {
    return true;
  }

  // 2. OpenStreetMap
  if (hostMatches(host, 'openstreetmap.org') || hostMatches(host, 'osm.org')) {
    return true;
  }

  // 3. Waze
  if (hostMatches(host, 'waze.com')) return true;

  // 4. Apple Maps
  if (hostMatches(host, 'maps.apple.com')) return true;

  return false;
}

