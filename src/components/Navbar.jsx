import React from 'react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="text-xl font-bold tracking-wider text-white">
          HARSHIT RAI
        </div>
        <div className="text-xs tracking-widest uppercase px-2.5 py-1 rounded bg-slate-800 text-sky-400 font-medium border border-slate-700">
          Base Foundation
        </div>
      </div>
    </header>
  );
}
