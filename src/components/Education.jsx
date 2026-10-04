import React, { useState, useEffect } from 'react';
import { getEducation } from '../services/timelineService';
import { GraduationCap, BookOpen, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Education() {
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const fetchEducation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEducation();
      setEducationList(res.data || []);
      setError(res.error || null);
      setIsLive(Boolean(res.isLive));
    } catch (err) {
      setError(err.message || 'Failed to load education details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium bg-white dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-[#D7E2EA] mb-1 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-primary-500'}`} />
            <span>{isLive ? 'Cloud Firestore Academic Record' : 'Verified Academic Record'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101112] dark:text-[#D7E2EA] font-sans">
            Education
          </h2>
          <div className="w-12 h-0.5 bg-primary-500 mx-auto rounded-xs mt-2" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 p-8 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-[#141516]" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-neutral-200 dark:bg-[#141516] rounded" />
                  <div className="h-4 w-32 bg-neutral-200 dark:bg-[#141516] rounded" />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full bg-neutral-200 dark:bg-[#141516] rounded" />
                <div className="h-4 w-5/6 bg-neutral-200 dark:bg-[#141516] rounded" />
              </div>
            </div>
            <div className="lg:col-span-5 p-8 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 space-y-4 animate-pulse">
              <div className="h-6 w-32 bg-neutral-200 dark:bg-[#141516] rounded" />
              <div className="flex flex-wrap gap-2">
                <div className="h-8 w-24 bg-neutral-200 dark:bg-[#141516] rounded" />
                <div className="h-8 w-28 bg-neutral-200 dark:bg-[#141516] rounded" />
              </div>
            </div>
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
                Failed to load education
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {error}
              </p>
            </div>
            <button
              onClick={fetchEducation}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && educationList.length === 0 && (
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-white/10 max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-[#141516] text-neutral-500 dark:text-[#D7E2EA]/60 mx-auto flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#101112] dark:text-[#D7E2EA]">
              No Education Records
            </h3>
            <p className="text-sm text-neutral-500 dark:text-[#D7E2EA]/60">
              Academic information is currently being updated.
            </p>
          </div>
        )}

        {/* Dynamic Education Content (80% solid + 20% subtle glass) */}
        {!loading && !error && educationList.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Degree Card(s) - Solid Structural Surfaces */}
            <div className="lg:col-span-7 space-y-6">
              {educationList.map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 sm:p-6 lg:p-8 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs hover:border-neutral-300 dark:hover:border-white/20 transition-all space-y-5"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 shrink-0 border border-primary-200/50 dark:border-primary-800/40">
                      <GraduationCap size={26} />
                    </div>
                    <div className="min-w-0">
                      {edu.status && (
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-primary-50 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 mb-2">
                          {edu.status}
                        </span>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-[#101112] dark:text-[#D7E2EA] break-words">
                        {edu.degree}
                      </h3>
                      <p className="text-sm font-medium text-neutral-500 dark:text-[#D7E2EA]/65 mt-0.5 break-words">
                        {edu.institution}
                      </p>
                    </div>
                  </div>

                  {edu.highlights && edu.highlights.length > 0 && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-white/10 space-y-2.5">
                      <p className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-[#D7E2EA]/60 font-semibold">
                        Program Highlights
                      </p>
                      <ul className="space-y-2">
                        {edu.highlights.map((item, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-[#D7E2EA]/80">
                            <CheckCircle2 size={16} className="text-primary-500 mt-0.5 shrink-0" />
                            <span className="break-words">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Core Coursework Card - Subtle Glass Accent */}
            <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 rounded-xl glass-subtle shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 shrink-0 border border-primary-200/50 dark:border-primary-800/40">
                  <BookOpen size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#101112] dark:text-[#D7E2EA] break-words">
                  Core Coursework
                </h3>
              </div>

              <p className="text-sm text-neutral-600 dark:text-[#D7E2EA]/75">
                Rigorous foundational subjects in computer systems, computation theory, and software engineering.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {(educationList[0]?.courses || [
                  'Data Structures & Algorithms',
                  'Database Management Systems',
                  'Object-Oriented Programming',
                  'Operating Systems',
                  'Computer Networks',
                  'Software Engineering & Web Systems'
                ]).map((course) => (
                  <span
                    key={course}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-white/80 dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA]"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
