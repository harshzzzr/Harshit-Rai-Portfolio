import React from 'react';
import { GraduationCap, BookOpen, CheckCircle2 } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';

export default function Education() {
  const courses = [
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Object-Oriented Programming',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering & Web Systems'
  ];

  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Academic Background
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Education
          </h2>
          <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full mt-2" />
        </div>

        {/* Education Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Degree Card */}
          <div className="lg:col-span-7">
            {personalInfo.education.map((edu, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                    <GraduationCap size={28} />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-primary-50 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 mb-2">
                      {edu.status}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {edu.degree}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {edu.institution}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                    Program Highlights
                  </p>
                  <ul className="space-y-2">
                    {edu.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 size={16} className="text-primary-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Key Foundations Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                <BookOpen size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Core Coursework
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Rigorous foundational subjects in computer systems, computation theory, and software methodologies.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {courses.map((course) => (
                <span
                  key={course}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
