import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, FolderGit2, ArrowRight } from 'lucide-react';
import { GithubIcon } from './Icons';
import SafeImage from './SafeImage';

function ProjectCard({ project }) {
  const { id, title, description, technologies, featured, githubUrl, liveUrl, badge, image } = project;

  const fallbackBanner = (
    <div className="relative h-44 w-full bg-neutral-100 dark:bg-[#141516] flex items-center justify-center border-b border-neutral-200 dark:border-white/10 overflow-hidden">
      <div className="absolute inset-0 opacity-15 dark:opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="flex flex-col items-center gap-2 z-10">
        <div className="p-3 rounded-xl bg-white dark:bg-[#101112] shadow-xs border border-neutral-200 dark:border-white/10 text-primary-600 dark:text-primary-400">
          <FolderGit2 size={30} />
        </div>
        <span className="text-xs font-mono font-medium text-neutral-500 dark:text-[#D7E2EA]/60 tracking-wide">
          {badge || 'Project Architecture'}
        </span>
      </div>
    </div>
  );

  return (
    <article
      className={`group relative rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        featured
          ? 'glass-panel hover:border-black/20 dark:hover:border-white/30'
          : 'bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs hover:border-neutral-300 dark:hover:border-white/20'
      }`}
    >
      {/* Visual Header / Image Preview with Fallback */}
      <Link
        to={`/projects/${id}`}
        className="block relative h-44 w-full border-b border-neutral-200 dark:border-white/10 overflow-hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={`View details and architecture for ${title}`}
      >
        {image ? (
          <SafeImage
            src={image}
            alt={`Screenshot preview of ${title} application`}
            className="w-full h-44 object-cover group-hover:scale-[1.015] transition-transform duration-300"
            fallbackComponent={fallbackBanner}
          />
        ) : (
          fallbackBanner
        )}

        {/* Featured Tag */}
        {featured && (
          <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white shadow-xs">
            <Sparkles size={12} aria-hidden="true" />
            <span>Featured</span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#101112] dark:text-[#D7E2EA] break-words">
            <Link
              to={`/projects/${id}`}
              className="block hover:text-primary-600 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              {title}
            </Link>
          </h3>
          <p className="text-sm text-neutral-600 dark:text-[#D7E2EA]/75 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Technology Badges */}
        <div className="pt-2">
          <div className="flex flex-wrap gap-1.5">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-neutral-100 dark:bg-[#141516] text-neutral-700 dark:text-[#D7E2EA] border border-neutral-200/80 dark:border-white/8 break-words"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-4 border-t border-neutral-100 dark:border-white/8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-[#D7E2EA] hover:text-primary-600 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-0.5"
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-0.5"
                  aria-label={`View live demo of ${title} (opens in new tab)`}
                >
                  <ExternalLink size={15} />
                  <span>Demo</span>
                </a>
              ) : (
                <span className="text-xs font-mono text-neutral-500 dark:text-[#D7E2EA]/50">
                  Offline Build
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono text-neutral-500 dark:text-[#D7E2EA]/50">
              {featured ? 'Priority' : 'Standard'}
            </span>
          </div>

          {/* View Details Route Link */}
          <Link
            to={`/projects/${id}`}
            aria-label={`View architecture and full details for ${title}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-neutral-50 dark:bg-[#141516] hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-[#D7E2EA] hover:text-primary-600 dark:hover:text-white border border-neutral-200 dark:border-white/10 transition-colors group/btn focus-visible:ring-2 focus-visible:ring-primary-500 text-center"
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
