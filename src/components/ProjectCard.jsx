import React from 'react';
import { ExternalLink, Sparkles, FolderGit2 } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function ProjectCard({ project }) {
  const { title, description, technologies, featured, githubUrl, liveUrl, badge } = project;

  return (
    <div
      className={`group relative rounded-xl bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        featured
          ? 'border-primary-500/40 dark:border-primary-500/30 shadow-md hover:shadow-xl hover:border-primary-500'
          : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Visual Header / Image Placeholder Preview */}
      <div className="relative h-44 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Project Card Icon Banner */}
        <div className="flex flex-col items-center gap-2 z-10 transition-transform duration-300 group-hover:scale-105">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400">
            <FolderGit2 size={32} />
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 tracking-wide">
            {badge || 'Project Architecture'}
          </span>
        </div>

        {/* Featured Tag */}
        {featured && (
          <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-500 text-white shadow-sm">
            <Sparkles size={12} />
            <span>Featured</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Technology Badges */}
        <div className="pt-2">
          <div className="flex flex-wrap gap-1.5">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title="View Source Code"
              >
                <GithubIcon size={15} />
                <span>Source</span>
              </a>
            )}

            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                title="View Live Application"
              >
                <ExternalLink size={15} />
                <span>Live Demo</span>
              </a>
            ) : (
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                Offline / Embedded
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            {featured ? 'Priority Build' : 'Active Build'}
          </span>
        </div>
      </div>
    </div>
  );
}
