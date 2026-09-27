import { personalInfo } from '../data/portfolioData';

export const SPOTIFY_PROFILE_URL =
  import.meta.env.VITE_SPOTIFY_URL || personalInfo.socials.spotify || 'https://open.spotify.com/user/31b6a5xevyjjpxunwv3fr2f662mu';

export const SPOTIFY_USERNAME =
  import.meta.env.VITE_SPOTIFY_USERNAME || personalInfo.socials.spotifyUsername || '31b6a5xevyjjpxunwv3fr2f662mu';

export const CODING_SOUNDTRACKS = [
  {
    id: 'track-1',
    title: 'Deep Focus & Ambient Electronics',
    artist: 'Synthesized Flow & Algorithms',
    album: 'Coding Sessions Vol. 1',
    genre: 'Lo-Fi / Ambient / Synthwave',
    songUrl: SPOTIFY_PROFILE_URL,
    duration: 'Focus Track',
    coverColor: 'from-emerald-600 to-teal-800'
  },
  {
    id: 'track-2',
    title: 'Minimal Piano & Algorithmic Reverie',
    artist: 'Instrumental Productivity',
    album: 'Architectural Thinking',
    genre: 'Modern Classical',
    songUrl: SPOTIFY_PROFILE_URL,
    duration: 'Deep Work',
    coverColor: 'from-blue-600 to-indigo-900'
  },
  {
    id: 'track-3',
    title: 'Night Systems & Downtempo Beats',
    artist: 'Late Night Developer Sessions',
    album: 'Zero Interruptions',
    genre: 'Downtempo / Electronic',
    songUrl: SPOTIFY_PROFILE_URL,
    duration: 'Night Session',
    coverColor: 'from-slate-700 to-slate-900'
  }
];

/**
 * Architectural Currently-Playing Service
 *
 * SECURE ARCHITECTURE NOTE:
 * Spotify's Web API (/v1/me/player/currently-playing) requires an OAuth 2.0 User Access Token.
 * To adhere strictly to security best practices and prevent client secret exposure in public
 * frontend bundles, live polling is routed through an optional backend proxy (e.g. Vercel /
 * Cloud Functions: VITE_SPOTIFY_NOW_PLAYING_ENDPOINT).
 *
 * If no proxy is configured or the user is not actively streaming music:
 * - Fails gracefully with isPlaying: false.
 * - Displays a clean, attractive Spotify profile card with curated coding flow soundtracks.
 * - Zero mandatory authentication or login wall for site visitors.
 */
let memoryCacheSpotify = null;
let memoryCacheSpotifyTime = 0;
const SPOTIFY_CACHE_TTL = 20 * 1000; // 20 seconds

export async function getCurrentlyPlaying() {
  const now = Date.now();
  if (memoryCacheSpotify && now - memoryCacheSpotifyTime < SPOTIFY_CACHE_TTL) {
    return memoryCacheSpotify;
  }

  const customEndpoint = import.meta.env.VITE_SPOTIFY_NOW_PLAYING_ENDPOINT;

  if (customEndpoint) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(customEndpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      // 204: No Content (Nothing currently playing)
      if (res.status === 204) {
        const result = {
          isPlaying: false,
          status: 'idle',
          profileUrl: SPOTIFY_PROFILE_URL,
          soundtracks: CODING_SOUNDTRACKS
        };
        memoryCacheSpotify = result;
        memoryCacheSpotifyTime = now;
        return result;
      }

      if (res.ok) {
        const data = await res.json();
        if (data && data.item) {
          const result = {
            isPlaying: Boolean(data.is_playing),
            title: data.item.name || 'Coding Track',
            artist: (data.item.artists || []).map((a) => a.name).join(', ') || 'Various Artists',
            album: data.item.album?.name || '',
            albumImageUrl: data.item.album?.images?.[0]?.url || '',
            songUrl: data.item.external_urls?.spotify || SPOTIFY_PROFILE_URL,
            durationMs: data.item.duration_ms,
            progressMs: data.progress_ms,
            profileUrl: SPOTIFY_PROFILE_URL,
            soundtracks: CODING_SOUNDTRACKS
          };
          memoryCacheSpotify = result;
          memoryCacheSpotifyTime = now;
          return result;
        } else if (data && data.title) {
          // Custom formatted response from serverless function
          const result = {
            isPlaying: Boolean(data.isPlaying),
            title: data.title,
            artist: data.artist || 'Various Artists',
            album: data.album || '',
            albumImageUrl: data.albumImageUrl || '',
            songUrl: data.songUrl || SPOTIFY_PROFILE_URL,
            profileUrl: SPOTIFY_PROFILE_URL,
            soundtracks: CODING_SOUNDTRACKS
          };
          memoryCacheSpotify = result;
          memoryCacheSpotifyTime = now;
          return result;
        }
      }
    } catch {
      // Graceful offline/network failure
    }
  }

  // Clean offline / curated focus listening mode
  const fallback = {
    isPlaying: false,
    status: 'idle',
    title: 'Curated Coding Soundtrack',
    artist: 'Instrumental & Electronic Lo-Fi',
    album: 'Deep Work Atmosphere',
    albumImageUrl: null,
    songUrl: SPOTIFY_PROFILE_URL,
    profileUrl: SPOTIFY_PROFILE_URL,
    soundtracks: CODING_SOUNDTRACKS
  };
  memoryCacheSpotify = fallback;
  memoryCacheSpotifyTime = now;
  return fallback;
}
