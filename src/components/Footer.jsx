import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon, LeetcodeIcon, SpotifyIcon } from './Icons';
import { personalInfo } from '../data/portfolioData';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="sm:col-span-2 space-y-3">
            <a
              href="#hero"
              className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white font-bold tracking-tight text-lg"
            >
              <span className="font-mono text-primary-600 dark:text-primary-400">&lt;</span>
              <span>Harshit Rai</span>
              <span className="font-mono text-primary-600 dark:text-primary-400">/&gt;</span>
            </a>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Computer Engineering Student & Developer crafting dependable software, scalable architectures, and modern web applications.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  About Me
                </a>
              </li>
              <li>
                <a href="#skills" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Skills & Tech
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Featured Projects
                </a>
              </li>
              <li>
                <a href="#github" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  GitHub Repositories
                </a>
              </li>
              <li>
                <a href="#coding" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Coding & LeetCode
                </a>
              </li>
              <li>
                <a href="#education" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Education
                </a>
              </li>
              <li>
                <a href="#experience" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Experience & Track
                </a>
              </li>
              <li>
                <a href="#profiles" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Social & Coding Profiles
                </a>
              </li>
              <li>
                <a href="#spotify" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Spotify Focus Audio
                </a>
              </li>
              <li>
                <a href="#feedback" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Feedback & Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Connect & Social Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white font-semibold">
              Connect
            </h4>
            <div className="flex items-center gap-2">
              <a
                href={personalInfo.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="GitHub profile of Harshit Rai (opens in new tab)"
              >
                <GithubIcon size={16} />
              </a>
              <a
                href={personalInfo.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="LinkedIn profile of Harshit Rai (opens in new tab)"
              >
                <LinkedinIcon size={16} />
              </a>
              <a
                href={personalInfo.socials.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="LeetCode profile of Harshit Rai (opens in new tab)"
              >
                <LeetcodeIcon size={16} />
              </a>
              <a
                href={personalInfo.socials.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Spotify profile of Harshit Rai (opens in new tab)"
              >
                <SpotifyIcon size={16} />
              </a>
            </div>

            <div className="pt-2 text-xs text-slate-600 dark:text-slate-400">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <Mail size={13} className="shrink-0" />
                <span className="break-all">{personalInfo.contact.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2">
            <p>
              © {new Date().getFullYear()} Harshit Rai. All rights reserved.
            </p>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline" aria-hidden="true">•</span>
            <Link
              to="/privacy"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline" aria-hidden="true">•</span>
            <Link
              to="/terms"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              Terms & Conditions
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-1 cursor-pointer"
              aria-label="Scroll to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
