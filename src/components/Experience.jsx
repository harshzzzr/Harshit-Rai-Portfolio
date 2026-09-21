import React, { useState, useEffect } from 'react';
import { getTimelineData } from '../services/timelineService';
import {
  Briefcase,
  Trophy,
  FlaskConical,
  Award,
  BookmarkCheck,
  Calendar,
  Building2,
  AlertCircle,
  RefreshCw,
  FolderX
} from 'lucide-react';

const tabs = [
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'research', label: 'Research', icon: FlaskConical },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'certifications', label: 'Certifications', icon: BookmarkCheck },
];

export default function Experience() {
  const [activeTab, setActiveTab] = useState('experience');
  const [timelineData, setTimelineData] = useState({
    experience: [],
    hackathons: [],
    research: [],
    achievements: [],
    certifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTimelineData();
      setTimelineData(res.data || {
        experience: [],
        hackathons: [],
        research: [],
        achievements: [],
        certifications: []
      });
      setError(res.error || null);
      setIsLive(Boolean(res.isLive));
    } catch (err) {
      setError(err.message || 'Failed to load timeline items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const items = timelineData[activeTab] || [];

  const handleTabKeyDown = (e, currentIndex) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex].id);
      document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex].id);
      document.getElementById(`tab-${tabs[prevIndex].id}`)?.focus();
    }
  };

  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 mb-1">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-primary-500'}`} aria-hidden="true" />
            <span>{isLive ? 'Cloud Firestore Verified Timeline' : 'Verified Career & Project Timeline'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Experience & Journey
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Practical engineering experience, hackathons, academic research, and technical certifications.
          </p>
          <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full mt-2" aria-hidden="true" />
        </div>

        {/* Category Navigation Tabs */}
        {!loading && (
          <div role="tablist" aria-label="Experience Categories" className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const count = (timelineData[tab.id] || []).length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="timeline-panel"
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-primary-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-md mx-auto p-6 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-4 shadow-sm animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                Failed to load timeline records
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {error}
              </p>
            </div>
            <button
              onClick={fetchTimeline}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 max-w-md mx-auto space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <FolderX size={20} />
            </div>
            <p className="text-sm text-slate-500">
              No verified records currently found for {tabs.find((t) => t.id === activeTab)?.label}.
            </p>
          </div>
        )}

        {/* Timeline Content */}
        {!loading && !error && items.length > 0 && (
          <div
            id="timeline-panel"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="max-w-3xl mx-auto"
          >
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2 sm:ml-6 space-y-6 sm:space-y-8 py-2">
              {items.map((item) => (
                <div key={item.id} className="relative pl-4 sm:pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-950 border-2 border-primary-500 group-hover:scale-125 transition-transform" />

                  {/* Card */}
                  <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words">
                        {item.title}
                      </h3>
                      {item.period && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded shrink-0">
                          <Calendar size={13} />
                          <span>{item.period}</span>
                        </div>
                      )}
                    </div>

                    {(item.role || item.organization) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                        <Building2 size={15} className="shrink-0" />
                        <span className="break-words">
                          {item.role} {item.organization ? `• ${item.organization}` : ''}
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
