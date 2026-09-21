import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-slate-400 text-sm">
      <div className="max-w-6xl mx-auto px-4">
        <p>© {new Date().getFullYear()} Harshit Rai. All rights reserved.</p>
      </div>
    </footer>
  );
}
