import React, { useState, useEffect } from 'react';
import {
  getCurrentlyPlaying,
  SPOTIFY_PROFILE_URL,
  SPOTIFY_USERNAME,
  CODING_SOUNDTRACKS
} from '../services/spotifyService';
import { SpotifyIcon } from './Icons';
import {
  ExternalLink,
  RefreshCw,
  Headphones,
  Radio,
  Music,
  Disc3,
  Sparkles,
  ShieldCheck,
  Volume2
} from 'lucide-react';

export default function SpotifySection() {
  const [playback, setPlayback] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayback = async () => {
    setLoading(true);
    try {
      const data = await getCurrentlyPlaying();
      setPlayback(data);
    } catch (err) {
      console.warn('[SpotifySection] Error checking playback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayback();
  }, []);

  const isLive = playback?.isPlaying;

  return (
    <section id="spotify" className="py-20 relative border-t border-neutral-200 dark:border-white/10">
      {/* Anchor for #listening */}
      <div id="listening" className="absolute -top-16 left-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/25 mb-3 shadow-xs">
            <SpotifyIcon size={14} className="text-[#1DB954]" />
            <span>Audio Atmosphere & Focus</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#D7E2EA]">
            Currently Listening & Coding Flow
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-[#D7E2EA]/70">
            Ambient soundscapes and background tracks powering full-stack architecture, algorithm development, and deep focus sessions.
          </p>
        </div>

        {/* Profile Status & Action Bar */}
        <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
            {/* Spotify Brand & Profile Info */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1DB954] text-white p-2.5 sm:p-3 flex items-center justify-center shadow-md shadow-[#1DB954]/20">
                  <SpotifyIcon size={30} />
                </div>
                {/* Live Equalizer Status Pill */}
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#101112] flex items-center justify-center ${
                    isLive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-400'
                  }`}
                  title={isLive ? 'Active Playback Stream' : 'Focus Mode Active'}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-[#D7E2EA] break-words">
                    Spotify Profile
                  </h3>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                    @{SPOTIFY_USERNAME}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-[#D7E2EA]/60 mt-0.5 line-clamp-1">
                  Deep Work Ambient • Instrumental Synthwave • Downtempo Engineering Beats
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-start md:self-auto w-full md:w-auto">
              <button
                onClick={fetchPlayback}
                disabled={loading}
                aria-label="Refresh Spotify playback status"
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#141516] text-neutral-600 dark:text-[#D7E2EA]/70 hover:text-neutral-900 dark:hover:text-[#D7E2EA] hover:bg-neutral-100 dark:hover:bg-[#1a1c1e] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1DB954] shrink-0"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              </button>

              <a
                href={SPOTIFY_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Spotify Profile of Harshit Rai (opens in new tab)"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-white font-semibold text-xs transition-colors shadow-sm shadow-[#1DB954]/25 focus-visible:ring-2 focus-visible:ring-[#1DB954] flex-1 sm:flex-initial"
              >
                <span>Open Spotify Profile</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid: Currently Playing Player (Left: Selective Glass Panel) + Curated Soundtracks (Right: Solid Architectural Surfaces) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Currently Listening Player Card (lg: 6 cols - Architectural Glass Focal Surface) */}
          <div className="lg:col-span-6 rounded-2xl glass-panel p-4 sm:p-7 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              {/* Card Header with Animated Equalizer */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Headphones size={18} className="text-[#1DB954]" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-[#D7E2EA]">
                    {isLive ? 'Currently Listening' : 'Curated Coding Soundtrack'}
                  </h3>
                </div>

                {/* Animated Soundwave Bars */}
                <div className="flex items-end gap-1 h-5" aria-hidden="true">
                  <span className={`w-1 bg-[#1DB954] rounded-full transition-all ${isLive ? 'h-5 animate-pulse' : 'h-2'}`} />
                  <span className={`w-1 bg-[#1DB954] rounded-full transition-all ${isLive ? 'h-3 animate-pulse delay-75' : 'h-3'}`} />
                  <span className={`w-1 bg-[#1DB954] rounded-full transition-all ${isLive ? 'h-6 animate-pulse delay-150' : 'h-4'}`} />
                  <span className={`w-1 bg-[#1DB954] rounded-full transition-all ${isLive ? 'h-4 animate-pulse delay-100' : 'h-2.5'}`} />
                  <span className={`w-1 bg-[#1DB954] rounded-full transition-all ${isLive ? 'h-2 animate-pulse delay-200' : 'h-1.5'}`} />
                </div>
              </div>

              {/* Player Body with Album Artwork */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                {/* Artwork Container */}
                <div className="relative shrink-0 group">
                  {playback?.albumImageUrl ? (
                    <img
                      src={playback.albumImageUrl}
                      alt={`Album artwork for ${playback.title || 'Track'} by ${playback.artist || 'Artist'}`}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md border border-neutral-200 dark:border-white/10 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-neutral-100 dark:bg-[#141516] text-white flex flex-col items-center justify-center p-3 border border-neutral-200 dark:border-white/10 shadow-md" aria-hidden="true">
                      <Disc3 size={34} className="text-[#1DB954] animate-spin duration-3000" />
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-[#D7E2EA]/60 mt-2">Spotify Audio</span>
                    </div>
                  )}

                  <span className="absolute -top-2 -right-2 p-1.5 rounded-full bg-neutral-900 text-[#1DB954] shadow-md border border-neutral-700">
                    <Volume2 size={13} />
                  </span>
                </div>

                {/* Track Details */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Radio size={11} className={isLive ? 'animate-pulse' : ''} />
                    <span>{isLive ? 'Streaming Now on Spotify' : 'Coding Soundtrack'}</span>
                  </div>

                  <div>
                    <h5 className="text-lg font-bold text-neutral-900 dark:text-[#D7E2EA] hover:text-[#1DB954] transition-colors line-clamp-1">
                      {playback?.title || 'Ambient Flow & Focus Code'}
                    </h5>
                    <p className="text-sm font-medium text-neutral-700 dark:text-[#D7E2EA]/80 line-clamp-1">
                      {playback?.artist || 'Instrumental & Synthwave'}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-[#D7E2EA]/50 font-mono mt-0.5 line-clamp-1">
                      {playback?.album || 'Deep Work Soundscapes'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <a
                      href={playback?.songUrl || SPOTIFY_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1DB954] hover:text-[#1aa34a] hover:underline cursor-pointer"
                    >
                      <span>Listen on Spotify</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Decoupled Architecture Security Badge */}
              <div className="p-3.5 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-[11px] text-neutral-600 dark:text-[#D7E2EA]/70 flex items-start gap-2">
                <ShieldCheck size={15} className="text-[#1DB954] shrink-0 mt-0.5" />
                <span>
                  Decoupled Spotify Architecture: Zero client secrets exposed in frontend bundles. No visitor login or authentication required to browse the portfolio.
                </span>
              </div>
            </div>
          </div>

          {/* Right: Curated Coding Flow Soundtracks (lg: 6 cols - Solid Architectural Surfaces) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-[#1DB954]" aria-hidden="true" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-[#D7E2EA]">
                  Curated Coding Flow Playlists
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-500 dark:text-[#D7E2EA]/60">Spotify Verified</span>
            </div>

            <div className="space-y-3">
              {CODING_SOUNDTRACKS.map((item) => (
                <a
                  key={item.id}
                  href={item.songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Listen to ${item.title} by ${item.artist} on Spotify (opens in new tab)`}
                  className="group block p-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] shadow-sm hover:border-[#1DB954]/40 hover:bg-neutral-50 dark:hover:bg-[#141516] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#1DB954]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.coverColor} text-white flex items-center justify-center shrink-0 shadow-xs`}
                        aria-hidden="true"
                      >
                        <Music size={18} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-[#D7E2EA] group-hover:text-[#1DB954] transition-colors truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-[#D7E2EA]/70 truncate">
                          {item.artist} • {item.album}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hidden sm:inline-block">
                        {item.genre}
                      </span>
                      <ExternalLink
                        size={14}
                        className="text-neutral-400 group-hover:text-[#1DB954] transition-colors"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
