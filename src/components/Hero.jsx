import React from 'react';
import { ArrowDown, FileText } from 'lucide-react';
import { GithubIcon, LinkedinIcon, LeetcodeIcon, SpotifyIcon } from './Icons';
import { personalInfo } from '../data/portfolioData';
import SafeImage from './SafeImage';

export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Subtle architectural structural grid (Section 6) */}
      <div
        className="absolute inset-0 bg-architectural-grid opacity-40 pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_65%_50%_at_50%_45%,#000_40%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Profile Image */}
        {personalInfo.profileImage && (
          <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-black/10 dark:border-white/20 shadow-sm">
            <SafeImage
              src={personalInfo.profileImage}
              alt={`Portrait of ${personalInfo.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Intro Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-white dark:bg-[#141516] border border-black/10 dark:border-white/10 text-neutral-800 dark:text-[#D7E2EA] shadow-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>Available for Developer Roles & Collaborations</span>
        </div>

        {/* Name and Titles */}
        <div className="space-y-3">
          <p className="text-base sm:text-lg font-medium text-neutral-600 dark:text-[#D7E2EA]/70">
            Hi, I'm
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#101112] dark:text-[#D7E2EA] break-words uppercase font-sans">
            {personalInfo.name}
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-primary-600 dark:text-primary-400">
            {personalInfo.role}
          </p>
        </div>

        {/* Short Bio */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-neutral-600 dark:text-[#D7E2EA]/75 leading-relaxed">
          {personalInfo.shortBio}
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-md mx-auto sm:max-w-none">
          <a
            href="#projects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-[#D7E2EA] dark:hover:bg-white dark:text-[#0C0C0C] text-sm sm:text-base font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span>View Projects</span>
            <ArrowDown size={16} aria-hidden="true" />
          </a>

          <a
            href="/resume/resume.pdf"
            download="Harshit_Rai_Resume.pdf"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-neutral-800 dark:text-[#D7E2EA] text-sm sm:text-base font-semibold border border-neutral-300 dark:border-white/20 shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Download resume PDF of Harshit Rai"
          >
            <FileText size={16} aria-hidden="true" />
            <span>Download Resume</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="pt-6">
          <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-[#D7E2EA]/60 mb-3 font-semibold">
            Connect & Profiles
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Profile"
              className="p-2.5 rounded-xl bg-white dark:bg-[#101112] hover:bg-neutral-100 dark:hover:bg-[#141516] text-neutral-700 dark:text-[#D7E2EA] hover:text-primary-600 dark:hover:text-white border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/25 transition-all focus-visible:ring-2 focus-visible:ring-primary-500 shadow-xs"
              aria-label="GitHub profile of Harshit Rai (opens in new tab)"
            >
              <GithubIcon size={18} />
            </a>
            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn Profile"
              className="p-2.5 rounded-xl bg-white dark:bg-[#101112] hover:bg-neutral-100 dark:hover:bg-[#141516] text-neutral-700 dark:text-[#D7E2EA] hover:text-primary-600 dark:hover:text-white border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/25 transition-all focus-visible:ring-2 focus-visible:ring-primary-500 shadow-xs"
              aria-label="LinkedIn profile of Harshit Rai (opens in new tab)"
            >
              <LinkedinIcon size={18} />
            </a>
            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              title="LeetCode Profile"
              className="p-2.5 rounded-xl bg-white dark:bg-[#101112] hover:bg-neutral-100 dark:hover:bg-[#141516] text-neutral-700 dark:text-[#D7E2EA] hover:text-primary-600 dark:hover:text-white border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/25 transition-all focus-visible:ring-2 focus-visible:ring-primary-500 shadow-xs"
              aria-label="LeetCode profile of Harshit Rai (opens in new tab)"
            >
              <LeetcodeIcon size={18} />
            </a>
            <a
              href={personalInfo.socials.spotify}
              target="_blank"
              rel="noopener noreferrer"
              title="Spotify Profile"
              className="p-2.5 rounded-xl bg-white dark:bg-[#101112] hover:bg-neutral-100 dark:hover:bg-[#141516] text-neutral-700 dark:text-[#D7E2EA] hover:text-primary-600 dark:hover:text-white border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/25 transition-all focus-visible:ring-2 focus-visible:ring-primary-500 shadow-xs"
              aria-label="Spotify profile of Harshit Rai (opens in new tab)"
            >
              <SpotifyIcon size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
