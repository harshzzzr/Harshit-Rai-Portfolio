import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-clip bg-transparent text-[#101112] dark:text-[#D7E2EA] transition-colors duration-200">
      {/* Accessibility: Skip to Main Content Link for Keyboard and Screen-Reader Visitors */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary-600 focus:text-white focus:font-semibold focus:text-sm focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex="-1" className="flex-1 w-full focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
