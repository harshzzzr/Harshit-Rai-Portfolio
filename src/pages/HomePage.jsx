import React from 'react';

export default function HomePage() {
  return (
    <div className="text-center space-y-4 max-w-xl">
      <div className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-sky-400 uppercase bg-sky-950/60 border border-sky-800/60 rounded-full">
        Portfolio Foundation Ready
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
        Harshit Rai
      </h1>
      <p className="text-xl sm:text-2xl text-slate-300 font-medium">
        Portfolio
      </p>
      <p className="text-slate-400 text-sm sm:text-base pt-2">
        Coming Soon
      </p>
    </div>
  );
}
