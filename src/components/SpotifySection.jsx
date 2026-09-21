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
    <section id="spotify" className="py-20 bg-slate-50/60 dark:bg-slate-900/40 relative border-t border-slate-200/80 dark:border-slate-800/80">
      {/* Anchor for #listening */}
      <div id="listening" className="absolute -top-16 left-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/30 mb-3 shadow-xs">
            <SpotifyIcon size={14} className="text-[#1DB954]" />
            <span>Audio Atmosphere & Focus</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Currently Listening & Coding Flow
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Ambient soundscapes and background tracks powering full-stack architecture, algorithm development, and deep focus sessions.
          </p>
        </div>

        {/* Profile Status & Action Bar */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Spotify Brand & Profile Info */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#1DB954] text-white p-3 flex items-center justify-center shadow-md shadow-[#1DB954]/20">
                  <SpotifyIcon size={32} />
                </div>
                {/* Live Equalizer Status Pill */}
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center ${
                    isLive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-400'
                  }`}
                  title={isLive ? 'Active Playback Stream' : 'Focus Mode Active'}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Spotify Profile
                  </h3>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    @{SPOTIFY_USERNAME}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deep Work Ambient • Instrumental Synthwave • Downtempo Engineering Beats
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                onClick={fetchPlayback}
                disabled={loading}
                aria-label="Refresh Spotify playback status"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1DB954]"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              </button>

              <a
                href={SPOTIFY_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Spotify Profile of Harshit Rai (opens in new tab)"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-white font-semibold text-xs transition-colors shadow-sm shadow-[#1DB954]/25 focus-visible:ring-2 focus-visible:ring-[#1DB954]"
              >
                <span>Open Spotify Profile</span>
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid: Currently Playing Player (Left) + Curated Soundtracks (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Currently Listening Player Card (lg: 6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              {/* Card Header with Animated Equalizer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Headphones size={18} className="text-[#1DB954]" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isLive ? 'Currently Listening' : 'Focus Audio Atmosphere'}
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
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Artwork Container */}
                <div className="relative shrink-0 group">
                  {playback?.albumImageUrl ? (
                    <img
                      src={playback.albumImageUrl}
                      alt={`Album artwork for ${playback.title || 'Track'} by ${playback.artist || 'Artist'}`}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#1DB954]/20 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center p-3 border border-slate-200 dark:border-slate-800 shadow-md" aria-hidden="true">
                      <Disc3 size={38} className="text-[#1DB954] animate-spin duration-3000" />
                      <span className="text-[10px] font-mono text-slate-400 mt-2">Spotify Audio</span>
                    </div>
                  )}

                  <span className="absolute -top-2 -right-2 p-1.5 rounded-full bg-slate-900 text-[#1DB954] shadow-md border border-slate-700">
                    <Volume2 size={13} />
                  </span>
                </div>

                {/* Track Details */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Radio size={11} className={isLive ? 'animate-pulse' : ''} />
                    <span>{isLive ? 'Streaming Now on Spotify' : 'Curated Coding Session'}</span>
                  </div>

                  <div>
                    <h5 className="text-lg font-bold text-slate-900 dark:text-white hover:text-[#1DB954] transition-colors line-clamp-1">
                      {playback?.title || 'Ambient Flow & Focus Code'}
                    </h5>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                      {playback?.artist || 'Instrumental & Synthwave'}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">
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
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <ShieldCheck size={15} className="text-[#1DB954] shrink-0 mt-0.5" />
                <span>
                  Decoupled Spotify Architecture: Zero client secrets exposed in frontend bundles. No visitor login or authentication required to browse the portfolio.
                </span>
              </div>
            </div>
          </div>

          {/* Right: Curated Coding Flow Soundtracks (lg: 6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-[#1DB954]" aria-hidden="true" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Curated Coding Flow Playlists
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Spotify Verified</span>
            </div>

            <div className="space-y-3">
              {CODING_SOUNDTRACKS.map((item) => (
                <a
                  key={item.id}
                  href={item.songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Listen to ${item.title} by ${item.artist} on Spotify (opens in new tab)`}
                  className="group block p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md hover:border-[#1DB954]/50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#1DB954]"
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
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1DB954] transition-colors truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
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
                        className="text-slate-400 group-hover:text-[#1DB954] transition-colors"
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
