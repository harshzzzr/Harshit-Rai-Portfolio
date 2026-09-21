import React, { useState } from 'react';
import { projectsData } from '../data/portfolioData';
import ProjectCard from './ProjectCard';

export default function Projects() {
  const [filter, setFilter] = useState('all');

  const filteredProjects = filter === 'featured'
    ? projectsData.filter((p) => p.featured)
    : projectsData;

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Selected Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Featured Projects
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Practical software implementations showcasing full-stack workflows, database engineering, and systems development.
          </p>
          <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full mt-2" />
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Projects ({projectsData.length})
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filter === 'featured'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Featured Only ({projectsData.filter((p) => p.featured).length})
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
