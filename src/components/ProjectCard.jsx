import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, FolderGit2, ArrowRight } from 'lucide-react';
import { GithubIcon } from './Icons';
import SafeImage from './SafeImage';

function ProjectCard({ project }) {
  const { id, title, description, technologies, featured, githubUrl, liveUrl, badge, image } = project;

  const fallbackBanner = (
    <div className="relative h-44 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="flex flex-col items-center gap-2 z-10 transition-transform duration-300 group-hover:scale-105">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400">
          <FolderGit2 size={32} />
        </div>
        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {badge || 'Project Architecture'}
        </span>
      </div>
    </div>
  );

  return (
    <article
      className={`group relative rounded-xl bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        featured
          ? 'border-primary-500/40 dark:border-primary-500/30 shadow-md hover:shadow-xl hover:border-primary-500'
          : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Visual Header / Image Preview with Fallback */}
      <Link
        to={`/projects/${id}`}
        className="block relative h-44 w-full border-b border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={`View details and architecture for ${title}`}
      >
        {image ? (
          <SafeImage
            src={image}
            alt={`Screenshot preview of ${title} application`}
            className="w-full h-44"
            fallbackComponent={fallbackBanner}
          />
        ) : (
          fallbackBanner
        )}

        {/* Featured Tag */}
        {featured && (
          <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-500 text-white shadow-sm">
            <Sparkles size={12} aria-hidden="true" />
            <span>Featured</span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white break-words">
            <Link
              to={`/projects/${id}`}
              className="block hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              {title}
            </Link>
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Technology Badges */}
        <div className="pt-2">
          <div className="flex flex-wrap gap-1.5">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 break-words"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-0.5"
                  aria-label={`View source code for ${title} on GitHub (opens in new tab)`}
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-0.5"
                  aria-label={`View live demo of ${title} (opens in new tab)`}
                >
                  <ExternalLink size={15} />
                  <span>Demo</span>
                </a>
              ) : (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Offline Build
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {featured ? 'Priority' : 'Standard'}
            </span>
          </div>

          {/* View Details Route Link */}
          <Link
            to={`/projects/${id}`}
            aria-label={`View architecture and full details for ${title}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-700 transition-colors group/btn focus-visible:ring-2 focus-visible:ring-primary-500 text-center"
          >
            <span>Project Details & Architecture</span>
            <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(ProjectCard);
