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
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Profile Image (Loaded from Firebase Storage when available) */}
        {personalInfo.profileImage && (
          <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-primary-500/60 shadow-md">
            <SafeImage
              src={personalInfo.profileImage}
              alt={`Portrait of ${personalInfo.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Intro Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary-700 dark:text-primary-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>Available for Developer Roles & Collaborations</span>
        </div>

        {/* Name and Titles */}
        <div className="space-y-3">
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-400">
            Hi, I'm
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {personalInfo.name.toUpperCase()}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary-600 dark:text-primary-400">
            {personalInfo.role}
          </p>
        </div>

        {/* Short Bio */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
          {personalInfo.shortBio}
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base font-semibold shadow-md shadow-primary-500/20 hover:shadow-primary-500/30 transition-all transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            <span>View Projects</span>
            <ArrowDown size={16} aria-hidden="true" />
          </a>

          <a
            href="/resume/resume.pdf"
            download="Harshit_Rai_Resume.pdf"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm sm:text-base font-semibold border border-slate-300 dark:border-slate-700 shadow-sm transition-all transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Download resume PDF of Harshit Rai"
          >
            <FileText size={16} aria-hidden="true" />
            <span>Download Resume</span>
          </a>
        </div>

        {/* Social Links */}
        <div className="pt-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 font-semibold">
            Connect & Profiles
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Profile"
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-800 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="GitHub profile of Harshit Rai (opens in new tab)"
            >
              <GithubIcon size={20} />
            </a>
            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn Profile"
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-800 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="LinkedIn profile of Harshit Rai (opens in new tab)"
            >
              <LinkedinIcon size={20} />
            </a>
            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              title="LeetCode Profile"
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-800 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="LeetCode profile of Harshit Rai (opens in new tab)"
            >
              <LeetcodeIcon size={20} />
            </a>
            <a
              href={personalInfo.socials.spotify}
              target="_blank"
              rel="noopener noreferrer"
              title="Spotify Profile"
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-800 transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Spotify profile of Harshit Rai (opens in new tab)"
            >
              <SpotifyIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
