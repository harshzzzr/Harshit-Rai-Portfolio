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
    <footer className="bg-white dark:bg-[#0C0C0C] border-t border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-[#D7E2EA]/70 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="sm:col-span-2 space-y-3">
            <a
              href="#hero"
              className="inline-flex items-center gap-1.5 text-neutral-900 dark:text-[#D7E2EA] font-bold tracking-tight text-lg"
            >
              <span className="font-mono text-neutral-400 dark:text-[#D7E2EA]/60">&lt;</span>
              <span>Harshit Rai</span>
              <span className="font-mono text-neutral-400 dark:text-[#D7E2EA]/60">/&gt;</span>
            </a>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#D7E2EA]/60 max-w-sm leading-relaxed">
              Computer Engineering Student & Developer crafting dependable software, scalable architectures, and modern web applications.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-[#D7E2EA] font-semibold">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#about" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  About Me
                </a>
              </li>
              <li>
                <a href="#skills" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Skills & Tech
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Featured Projects
                </a>
              </li>
              <li>
                <a href="#github" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  GitHub Repositories
                </a>
              </li>
              <li>
                <a href="#coding" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Coding & LeetCode
                </a>
              </li>
              <li>
                <a href="#education" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Education
                </a>
              </li>
              <li>
                <a href="#experience" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Experience & Track
                </a>
              </li>
              <li>
                <a href="#profiles" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Social & Coding Profiles
                </a>
              </li>
              <li>
                <a href="#spotify" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Spotify Focus Audio
                </a>
              </li>
              <li>
                <a href="#feedback" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
                  Feedback & Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Connect & Social Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-900 dark:text-[#D7E2EA] font-semibold">
              Connect
            </h4>
            <div className="flex items-center gap-2">
              <a
                href={personalInfo.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-neutral-100 dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA] hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#1a1c1e] transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400"
                aria-label="GitHub profile of Harshit Rai (opens in new tab)"
              >
                <GithubIcon size={16} />
              </a>
              <a
                href={personalInfo.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-neutral-100 dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA] hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#1a1c1e] transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400"
                aria-label="LinkedIn profile of Harshit Rai (opens in new tab)"
              >
                <LinkedinIcon size={16} />
              </a>
              <a
                href={personalInfo.socials.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-neutral-100 dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA] hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#1a1c1e] transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400"
                aria-label="LeetCode profile of Harshit Rai (opens in new tab)"
              >
                <LeetcodeIcon size={16} />
              </a>
              <a
                href={personalInfo.socials.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-neutral-100 dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA] hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#1a1c1e] transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400"
                aria-label="Spotify profile of Harshit Rai (opens in new tab)"
              >
                <SpotifyIcon size={16} />
              </a>
            </div>

            <div className="pt-2 text-xs text-neutral-600 dark:text-[#D7E2EA]/70">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-neutral-800 dark:text-[#D7E2EA] hover:underline focus-visible:ring-2 focus-visible:ring-neutral-400 rounded"
              >
                <Mail size={13} className="shrink-0" />
                <span className="break-all">{personalInfo.contact.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-[#D7E2EA]/60">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2">
            <p>
              © {new Date().getFullYear()} Harshit Rai. All rights reserved.
            </p>
            <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline" aria-hidden="true">•</span>
            <Link
              to="/privacy"
              className="hover:text-neutral-900 dark:hover:text-[#D7E2EA] transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 rounded"
            >
              Privacy Policy
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline" aria-hidden="true">•</span>
            <Link
              to="/terms"
              className="hover:text-neutral-900 dark:hover:text-[#D7E2EA] transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 rounded"
            >
              Terms & Conditions
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-neutral-700 dark:text-[#D7E2EA] hover:text-neutral-950 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 rounded p-1 cursor-pointer"
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
