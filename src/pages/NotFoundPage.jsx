import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <SEO
        title="Page Not Found | Harshit Rai"
        description="The requested page could not be found on Harshit Rai's developer portfolio."
        noindex={true}
      />
      <div className="max-w-lg w-full text-center space-y-6 bg-white dark:bg-[#101112] p-8 sm:p-10 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-xl">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-neutral-100 dark:bg-[#141516] border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-800 dark:text-[#D7E2EA]">
          <Compass size={44} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold tracking-widest uppercase text-neutral-500 dark:text-[#D7E2EA]/60">
            HTTP 404 Error
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-[#D7E2EA]">
            Page Not Found
          </h1>
          <p className="text-sm text-neutral-600 dark:text-[#D7E2EA]/70 max-w-sm mx-auto">
            The page or route you are attempting to reach does not exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-200/60 dark:border-white/10">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-[#D7E2EA] dark:hover:bg-white text-white dark:text-neutral-900 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            <Home size={16} />
            <span>Return to Portfolio</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#141516] hover:bg-neutral-200 dark:hover:bg-[#1a1c1e] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-[#D7E2EA] text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
