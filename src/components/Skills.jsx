import React, { useState, useEffect } from 'react';
import { getSkills } from '../services/skillService';
import {
  Code,
  Globe,
  Database,
  Wrench,
  Smartphone,
  Cpu,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const categoryIcons = {
  'Programming': Code,
  'Web Development': Globe,
  'Database': Database,
  'Tools': Wrench,
  'Mobile': Smartphone,
  'Mobile / Other Technologies': Smartphone,
  'Other': Cpu,
};

export default function Skills() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSkills();
      setCategories(res.data || []);
      setError(res.error || null);
      setIsLive(Boolean(res.isLive));
    } catch (err) {
      setError(err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium bg-white dark:bg-[#141516] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#D7E2EA] mb-1 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-primary-500'}`} />
            <span>{isLive ? 'Cloud Firestore Live Skills' : 'Categorized Technical Stack'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#D7E2EA] font-sans">
            Skills & Technologies
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#D7E2EA]/75 max-w-xl mx-auto">
            Practical experience across core languages, modern frameworks, data systems, and developer tooling.
          </p>
          <div className="w-12 h-0.5 bg-primary-500 mx-auto rounded-xs mt-2" />
        </div>

        {/* Loading State Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white dark:bg-[#101112] border border-slate-200 dark:border-white/10 space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-[#141516]" />
                  <div className="h-5 w-32 bg-slate-200 dark:bg-[#141516] rounded" />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="h-7 w-16 bg-slate-200 dark:bg-[#141516] rounded" />
                  <div className="h-7 w-20 bg-slate-200 dark:bg-[#141516] rounded" />
                  <div className="h-7 w-14 bg-slate-200 dark:bg-[#141516] rounded" />
                </div>
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
                Failed to load skills
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {error}
              </p>
            </div>
            <button
              onClick={fetchSkills}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-slate-300 dark:border-white/10 max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#141516] text-slate-500 mx-auto flex items-center justify-center">
              <Code size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#D7E2EA]">
              No Skills Available
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#D7E2EA]/60">
              Technical skills catalog is currently being updated in the database.
            </p>
          </div>
        )}

        {/* Categories Grid (Solid Architectural Surfaces - Section 18) */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((catGroup) => {
              const IconComponent = categoryIcons[catGroup.category] || Code;
              return (
                <div
                  key={catGroup.category}
                  className="p-4 sm:p-6 rounded-xl bg-white dark:bg-[#101112] border border-slate-200 dark:border-white/10 shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                      <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 shrink-0 border border-primary-200/50 dark:border-primary-800/40">
                        <IconComponent size={20} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-[#D7E2EA] break-words">
                        {catGroup.category}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-2.5">
                      {catGroup.skills.map((skill) => (
                        <span
                          key={skill.id || skill.name}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-white/8 text-slate-700 dark:text-[#D7E2EA] hover:border-primary-500/60 dark:hover:border-primary-500/60 hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-words"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                          <span>{skill.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-slate-400 dark:text-[#D7E2EA]/50">
                    {catGroup.skills.length} verified technologies
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
