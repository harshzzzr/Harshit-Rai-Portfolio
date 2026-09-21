import React, { useState } from 'react';
import { timelineData } from '../data/portfolioData';
import { Briefcase, Trophy, FlaskConical, Award, BookmarkCheck, Calendar, Building2 } from 'lucide-react';

const tabs = [
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'research', label: 'Research', icon: FlaskConical },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'certifications', label: 'Certifications', icon: BookmarkCheck },
];

export default function Experience() {
  const [activeTab, setActiveTab] = useState('experience');

  const items = timelineData[activeTab] || [];

  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Trajectory & Milestones
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Experience & Achievements
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Practical development trajectory, collaborative initiatives, academic research tracks, and milestones.
          </p>
          <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full mt-2" />
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = (timelineData[tab.id] || []).length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-primary-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeline Content */}
        <div className="max-w-3xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
              No entries currently recorded in this category.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 space-y-8 py-2">
              {items.map((item, index) => (
                <div key={index} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-950 border-2 border-primary-500 group-hover:scale-125 transition-transform" />

                  {/* Card */}
                  <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2.5 py-1 rounded">
                        <Calendar size={13} />
                        <span>{item.period}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                      <Building2 size={15} />
                      <span>{item.role} • {item.organization}</span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
