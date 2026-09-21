import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
