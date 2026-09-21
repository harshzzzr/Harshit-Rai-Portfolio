import { personalInfo } from '../data/portfolioData';

export const SPOTIFY_PROFILE_URL =
  import.meta.env.VITE_SPOTIFY_URL || personalInfo.socials.spotify || 'https://open.spotify.com/user/harshitrai';

export const CODING_SOUNDTRACKS = [
  {
    title: 'Deep Focus & Ambient Electronics',
    artist: 'Instrumental Coding Sessions',
    genre: 'Ambient / Lo-Fi / Synthwave'
  },
  {
    title: 'Modern Classical & Piano Algorithms',
    artist: 'High Productivity Flow',
    genre: 'Classical Minimal'
  },
  {
    title: 'Electronic Engineering Beats',
    artist: 'Night Coding Sessions',
    genre: 'Downtempo / Electronic'
  }
];

/**
 * Architectural Currently-Playing Service
 * Designed to connect with Spotify Web API or serverless proxy (/api/spotify-now-playing)
 * when credentials (Client ID/Refresh Token) are configured.
 *
 * CRITICAL RULE: Fails gracefully without throwing errors or requiring site visitors to log in.
 */
export async function getCurrentlyPlaying() {
  const customEndpoint = import.meta.env.VITE_SPOTIFY_NOW_PLAYING_ENDPOINT;

  if (customEndpoint) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(customEndpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.status === 204 || res.status > 400) {
        return {
          isPlaying: false,
          status: 'idle',
          profileUrl: SPOTIFY_PROFILE_URL,
          soundtracks: CODING_SOUNDTRACKS
        };
      }

      const data = await res.json();
      return {
        isPlaying: Boolean(data.isPlaying),
        title: data.title || '',
        artist: data.artist || '',
        album: data.album || '',
        albumImageUrl: data.albumImageUrl || '',
        songUrl: data.songUrl || SPOTIFY_PROFILE_URL,
        profileUrl: SPOTIFY_PROFILE_URL,
        soundtracks: CODING_SOUNDTRACKS
      };
    } catch {
      // Fall through to idle state
    }
  }

  // Graceful unconfigured / idle state
  return {
    isPlaying: false,
    status: 'idle',
    label: 'Focus & Productivity Audio',
    profileUrl: SPOTIFY_PROFILE_URL,
    soundtracks: CODING_SOUNDTRACKS
  };
}
