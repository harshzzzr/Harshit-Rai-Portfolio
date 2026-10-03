import React from 'react';
import { Terminal, Cpu, Layers } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';

export default function About() {
  const highlights = [
    {
      icon: Terminal,
      title: 'Problem Solving & Algorithms',
      description: 'Strengthening analytical thinking with core data structures, algorithms, and computational problem solving in C++ and Java.'
    },
    {
      icon: Layers,
      title: 'Full-Stack Development',
      description: 'Building modular client interfaces and RESTful server backends using modern JavaScript, React, Node.js, and Express.'
    },
    {
      icon: Cpu,
      title: 'Systems & Hardware Curiosity',
      description: 'Exploring low-level architectures, databases (SQL, NoSQL), microcontroller prototyping with Arduino, and 3D simulation in Unity.'
    }
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Background & Mindset
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#D7E2EA] font-sans">
            About Me
          </h2>
          <div className="w-12 h-0.5 bg-primary-500 mx-auto rounded-xs mt-2" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Narrative description */}
          <div className="lg:col-span-7 space-y-5 text-slate-600 dark:text-[#D7E2EA]/80 leading-relaxed text-base sm:text-lg">
            {personalInfo.about.map((paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            ))}
            <div className="pt-2 flex flex-wrap gap-3 font-mono text-xs sm:text-sm">
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141516] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#D7E2EA] shadow-xs">
                Focus: Computer Engineering
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141516] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#D7E2EA] shadow-xs">
                Architecture: Clean & Scalable
              </span>
            </div>
          </div>

          {/* Core Technical Pillars Cards (80% solid + 20% subtle glass) */}
          <div className="lg:col-span-5 space-y-4">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              const isGlassCard = idx === 2; // subtle glass accent on the systems card
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                    isGlassCard
                      ? 'glass-subtle hover:border-black/15 dark:hover:border-white/20'
                      : 'bg-white dark:bg-[#101112] border border-slate-200 dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 shrink-0 border border-primary-200/50 dark:border-primary-800/40">
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-[#D7E2EA] break-words">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-[#D7E2EA]/65 mt-1 leading-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
