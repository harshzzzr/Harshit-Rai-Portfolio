import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { label: 'Home', href: '/#hero' },
  { label: 'About', href: '/#about' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Projects', href: '/#projects' },
  { label: 'GitHub', href: '/#github' },
  { label: 'Coding', href: '/#coding' },
  { label: 'Education', href: '/#education' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Profiles', href: '/#profiles' },
  { label: 'Spotify', href: '/#spotify' },
  { label: 'Feedback', href: '/#feedback' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile navigation on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm'
          : 'bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/#hero"
            aria-label="Harshit Rai Portfolio Homepage"
            className="flex items-center gap-1.5 sm:gap-2 text-slate-900 dark:text-white font-bold tracking-tight text-base sm:text-xl group focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md shrink-0"
          >
            <span className="font-mono text-primary-600 dark:text-primary-400 font-semibold">&lt;</span>
            <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Harshit Rai
            </span>
            <span className="font-mono text-primary-600 dark:text-primary-400 font-semibold">/&gt;</span>
          </Link>

          {/* Full Desktop Navigation Links (>= 1280px) */}
          <nav className="hidden xl:flex items-center gap-1 lg:gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-2.5 py-1.5 text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}

            {/* Theme Toggle Desktop */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="ml-1 p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
            </button>
          </nav>

          {/* Medium Screen Quick Links (768px - 1279px) */}
          <div className="hidden md:flex xl:hidden items-center gap-1">
            {navItems
              .filter((item) => ['About', 'Projects', 'Experience', 'Contact'].includes(item.label))
              .map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-2.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {item.label}
                </a>
              ))}
          </div>

          {/* Mobile & Tablet Right Controls (< 1280px) */}
          <div className="flex items-center gap-1 xl:hidden">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Menu (< 1280px) */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="xl:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-5 space-y-1 animate-slide-down shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
