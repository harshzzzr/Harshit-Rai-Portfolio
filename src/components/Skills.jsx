import React from 'react';
import { skillsData } from '../data/portfolioData';
import { Code, Globe, Database, Wrench, Smartphone } from 'lucide-react';

const categoryIcons = {
  'Programming': Code,
  'Web Development': Globe,
  'Database': Database,
  'Tools': Wrench,
  'Mobile / Other Technologies': Smartphone,
};

export default function Skills() {
  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Technical Stack
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Skills & Technologies
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Practical experience across core programming languages, modern frameworks, data persistence layers, and developer tooling.
          </p>
          <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full mt-2" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillsData.map((catGroup) => {
            const IconComponent = categoryIcons[catGroup.category] || Code;
            return (
              <div
                key={catGroup.category}
                className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                      <IconComponent size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {catGroup.category}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {catGroup.skills.map((skill) => (
                      <span
                        key={skill.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-primary-500/60 dark:hover:border-primary-500/60 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        <span>{skill.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {catGroup.skills.length} verified technologies
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
