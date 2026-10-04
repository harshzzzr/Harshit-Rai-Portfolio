import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById } from '../services/projectService';
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Target,
  Lightbulb,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { GithubIcon } from '../components/Icons';
import SafeImage from '../components/SafeImage';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../config/site';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProject = React.useCallback(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getProjectById(projectId, { includeHidden: Boolean(isAdmin) })
      .then((res) => {
        if (!isMounted) return;
        setProject(res.data);
        setError(res.error);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading project');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [projectId, isAdmin]);

  useEffect(() => {
    const cleanup = fetchProject();
    return cleanup;
  }, [fetchProject]);

  // Loading State Skeleton
  if (loading) {
    return (
      <article className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 motion-safe:animate-pulse">
        {/* Back Link Skeleton */}
        <div className="h-5 w-36 bg-neutral-200 dark:bg-[#141516] rounded-md" />

        {/* Hero Header Banner Skeleton */}
        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] p-6 sm:p-10 space-y-6">
          <div className="flex gap-2">
            <div className="h-6 w-28 bg-neutral-200 dark:bg-[#141516] rounded-md" />
            <div className="h-6 w-24 bg-neutral-200 dark:bg-[#141516] rounded-md" />
          </div>
          <div className="space-y-3">
            <div className="h-10 w-3/4 sm:w-1/2 bg-neutral-200 dark:bg-[#141516] rounded-lg" />
            <div className="h-5 w-full sm:w-2/3 bg-neutral-200 dark:bg-[#141516] rounded-md" />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="h-10 w-36 bg-neutral-200 dark:bg-[#141516] rounded-lg" />
            <div className="h-10 w-36 bg-neutral-200 dark:bg-[#141516] rounded-lg" />
          </div>
        </div>

        {/* Main Details Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column Narrative */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview Card */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 space-y-4">
              <div className="h-6 w-40 bg-neutral-200 dark:bg-[#141516] rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-neutral-200 dark:bg-[#141516] rounded" />
                <div className="h-4 w-5/6 bg-neutral-200 dark:bg-[#141516] rounded" />
                <div className="h-4 w-4/6 bg-neutral-200 dark:bg-[#141516] rounded" />
              </div>
            </div>

            {/* Problem & Solution Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 space-y-3">
                <div className="h-5 w-28 bg-neutral-200 dark:bg-[#141516] rounded" />
                <div className="h-4 w-full bg-neutral-200 dark:bg-[#141516] rounded" />
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-[#141516] rounded" />
              </div>
              <div className="p-5 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 space-y-3">
                <div className="h-5 w-28 bg-neutral-200 dark:bg-[#141516] rounded" />
                <div className="h-4 w-full bg-neutral-200 dark:bg-[#141516] rounded" />
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-[#141516] rounded" />
              </div>
            </div>

            {/* Features Checklist */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 space-y-4">
              <div className="h-6 w-36 bg-neutral-200 dark:bg-[#141516] rounded" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-neutral-200 dark:bg-[#141516] rounded shrink-0" />
                    <div className="h-4 w-full bg-neutral-200 dark:bg-[#141516] rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 space-y-4">
              <div className="h-5 w-32 bg-neutral-200 dark:bg-[#141516] rounded" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((t) => (
                  <div key={t} className="h-6 w-16 bg-neutral-200 dark:bg-[#141516] rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Error State (Network or service failure)
  if (error && !project) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-5 shadow-lg animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={30} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-rose-900 dark:text-rose-200">
              Failed to load project
            </h1>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              {error}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={fetchProject}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
            <Link
              to="/#projects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA] text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Not Found State
  if (!project) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <SEO
          title="Project Not Found | Harshit Rai"
          description="The requested project could not be found in the portfolio repository."
          noindex={true}
        />
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-center space-y-5 shadow-lg animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#101112] dark:text-[#D7E2EA]">
              Project Not Found
            </h1>
            <p className="text-sm text-neutral-600 dark:text-[#D7E2EA]/70">
              The project identifier <code className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#141516] font-mono text-xs text-primary-600 dark:text-primary-400">"{projectId}"</code> does not match any project in our database.
            </p>
          </div>
          <Link
            to="/#projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Return to All Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  const projectSeoTitle = `${project.title} | Harshit Rai`;
  const projectSeoDesc = project.shortDescription || project.description || `${project.title} software engineering project by Harshit Rai, built with ${(project.technologies || []).join(', ')}.`;
  const projectCanonical = `${SITE_CONFIG.url}projects/${projectId}`;
  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${projectCanonical}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': SITE_CONFIG.url
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Projects',
            'item': `${SITE_CONFIG.url}#projects`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': project.title,
            'item': projectCanonical
          }
        ]
      },
      {
        '@type': 'SoftwareSourceCode',
        '@id': `${projectCanonical}#software`,
        'name': project.title,
        'headline': project.tagline || project.title,
        'description': projectSeoDesc,
        'programmingLanguage': (project.technologies || []).join(', '),
        'codeRepository': project.githubUrl || undefined,
        'author': {
          '@type': 'Person',
          '@id': `${SITE_CONFIG.url}#person`,
          'name': 'Harshit Rai',
          'url': SITE_CONFIG.url
        }
      }
    ]
  };

  return (
    <article className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 animate-fade-in">
      <SEO
        title={projectSeoTitle}
        description={projectSeoDesc}
        canonicalUrl={projectCanonical}
        ogType="article"
        ogImage={project.image || SITE_CONFIG.ogImage}
        jsonLd={projectJsonLd}
      />
      {/* Top Back Navigation */}
      <div>
        <Link
          to="/#projects"
          aria-label="Back to projects list on homepage"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-[#D7E2EA] hover:text-neutral-950 dark:hover:text-white transition-colors group focus-visible:ring-2 focus-visible:ring-neutral-400 rounded p-1"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Hero Visual Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#101112] shadow-sm">
        {/* Subtle architectural grid pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-architectural-grid pointer-events-none" aria-hidden="true" />

        <div className="relative p-5 sm:p-8 lg:p-12 space-y-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-neutral-100 dark:bg-white/[0.05] text-neutral-800 dark:text-[#D7E2EA] border border-neutral-200 dark:border-white/10">
              <FolderGit2 size={13} aria-hidden="true" />
              <span>{project.badge || 'Engineering Project'}</span>
            </span>

            {project.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-mono font-medium bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25 shadow-xs">
                <Sparkles size={12} aria-hidden="true" />
                <span>Featured Project</span>
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-[#D7E2EA] break-words">
              {project.title}
            </h1>
            {(project.shortDescription || project.tagline) && (
              <p className="text-sm sm:text-base lg:text-xl text-neutral-600 dark:text-[#D7E2EA]/75 max-w-3xl leading-relaxed">
                {project.shortDescription || project.tagline}
              </p>
            )}
          </div>

          {/* Action Links & Tech Stack overview */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View source code for ${project.title} on GitHub (opens in new tab)`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-[#D7E2EA] text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-90 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                <GithubIcon size={18} />
                <span>View Repository</span>
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View live demonstration of ${project.title} (opens in new tab)`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] hover:bg-neutral-50 dark:hover:bg-[#1a1c1e] text-sm font-semibold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                <ExternalLink size={18} aria-hidden="true" />
                <span>Live Demonstration</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Deep Dive Narrative */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Full Description / Overview */}
          {(project.fullDescription || project.overview) && (
            <section className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-neutral-900 dark:text-[#D7E2EA]">
                <Layers size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
                  Project Overview
                </h2>
              </div>
              <p className="text-sm sm:text-base text-neutral-700 dark:text-[#D7E2EA]/80 leading-relaxed">
                {project.fullDescription || project.overview}
              </p>
            </section>
          )}

          {/* Problem Statement */}
          {project.problem && (
            <section className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-amber-500 dark:text-amber-400">
                <Target size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
                  The Problem
                </h2>
              </div>
              <p className="text-sm sm:text-base text-neutral-700 dark:text-[#D7E2EA]/80 leading-relaxed">
                {project.problem}
              </p>
            </section>
          )}

          {/* Proposed Solution */}
          {project.solution && (
            <section className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-500 dark:text-emerald-400">
                <Lightbulb size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
                  The Solution & Architecture
                </h2>
              </div>
              <p className="text-sm sm:text-base text-neutral-700 dark:text-[#D7E2EA]/80 leading-relaxed">
                {project.solution}
              </p>
            </section>
          )}

          {/* Key Features */}
          {project.features && project.features.length > 0 && (
            <section className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-sm space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
                Key Features & Capabilities
              </h2>
              <ul className="space-y-3">
                {project.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-neutral-700 dark:text-[#D7E2EA]/80">
                    <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Screenshots Gallery (Rendered only when valid screenshots exist) */}
          {project.screenshots && project.screenshots.length > 0 && (
            <section className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <ImageIcon size={20} className="text-neutral-500 dark:text-[#D7E2EA]/70" />
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
                  Screenshots & Interface Previews
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.screenshots.map((shot, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-[#141516]">
                    <SafeImage
                      src={shot.url || shot}
                      alt={shot.caption || `Screenshot ${idx + 1}`}
                      className="w-full h-auto min-h-[160px] object-cover"
                      fallbackComponent={
                        <div className="h-40 flex items-center justify-center text-neutral-400 dark:text-[#D7E2EA]/50 text-xs font-mono">
                          Image preview unavailable
                        </div>
                      }
                    />
                    {shot.caption && (
                      <p className="p-2 text-xs font-mono text-neutral-500 dark:text-[#D7E2EA]/60 text-center">{shot.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Metadata & Tech Specs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Technologies Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-[#D7E2EA]">
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-neutral-100 dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-[#D7E2EA] break-words"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Info Summary */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-sm space-y-3 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-[#D7E2EA]">
              Project Specification
            </h3>
            <div className="divide-y divide-neutral-100 dark:divide-white/10 text-neutral-600 dark:text-[#D7E2EA]/70">
              <div className="py-2.5 flex justify-between">
                <span className="font-medium">Category</span>
                <span className="font-mono text-neutral-900 dark:text-[#D7E2EA]">{project.badge || 'Engineering'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-medium">Status</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Production Ready</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-medium">Code Availability</span>
                <span className="font-mono text-neutral-900 dark:text-[#D7E2EA]">Public Repository</span>
              </div>
              {project.order && (
                <div className="py-2.5 flex justify-between">
                  <span className="font-medium">Catalog Index</span>
                  <span className="font-mono text-neutral-900 dark:text-[#D7E2EA]">#{project.order}</span>
                </div>
              )}
            </div>
          </div>

          {/* Return button */}
          <Link
            to="/#projects"
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] hover:bg-neutral-50 dark:hover:bg-[#141516] text-neutral-800 dark:text-[#D7E2EA] text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to All Projects</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
