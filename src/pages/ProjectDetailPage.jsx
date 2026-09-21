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
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { GithubIcon } from '../components/Icons';
import SafeImage from '../components/SafeImage';
import SEO from '../components/SEO';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProject = () => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getProjectById(projectId)
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
  };

  useEffect(() => {
    const cleanup = fetchProject();
    return cleanup;
  }, [projectId]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Loading project from data architecture...</span>
        </div>
      </div>
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
          title="Project Not Found | Harshit Rai Developer Portfolio"
          description="The requested project could not be found in the portfolio repository."
          noindex={true}
        />
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-lg animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Project Not Found
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The project identifier <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-primary-600 dark:text-primary-400">"{projectId}"</code> does not match any project in our database.
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

  const projectSeoTitle = `${project.title} | Harshit Rai Developer Portfolio`;
  const projectSeoDesc = project.shortDescription || project.description || `${project.title} software engineering project by Harshit Rai, built with ${(project.technologies || []).join(', ')}.`;
  const projectCanonical = `https://harshitrai.com/projects/${projectId}`;
  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    'name': project.title,
    'headline': project.tagline || project.title,
    'description': projectSeoDesc,
    'programmingLanguage': (project.technologies || []).join(', '),
    'codeRepository': project.githubUrl || undefined,
    'author': {
      '@type': 'Person',
      'name': 'Harshit Rai',
      'url': 'https://harshitrai.com'
    }
  };

  return (
    <article className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 animate-fade-in">
      <SEO
        title={projectSeoTitle}
        description={projectSeoDesc}
        canonicalUrl={projectCanonical}
        ogType="article"
        ogImage={project.image || 'https://harshitrai.com/images/og-preview.png'}
        jsonLd={projectJsonLd}
      />
      {/* Top Back Navigation */}
      <div>
        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Hero Visual Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-md">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-25 dark:opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative p-6 sm:p-10 lg:p-12 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              <FolderGit2 size={13} />
              <span>{project.badge || 'Engineering Project'}</span>
            </span>

            {project.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
                <Sparkles size={12} />
                <span>Featured Project</span>
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {project.title}
            </h1>
            {(project.shortDescription || project.tagline) && (
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                {project.shortDescription || project.tagline}
              </p>
            )}
          </div>

          {/* Action Links & Tech Stack overview */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-all shadow-sm"
              >
                <ExternalLink size={18} />
                <span>Live Demonstration</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Deep Dive Narrative */}
        <div className="lg:col-span-8 space-y-8">
          {/* Full Description / Overview */}
          {(project.fullDescription || project.overview) && (
            <section className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-primary-600 dark:text-primary-400">
                <Layers size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Project Overview
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {project.fullDescription || project.overview}
              </p>
            </section>
          )}

          {/* Problem Statement */}
          {project.problem && (
            <section className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <Target size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  The Problem
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {project.problem}
              </p>
            </section>
          )}

          {/* Proposed Solution */}
          {project.solution && (
            <section className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <Lightbulb size={20} />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  The Solution & Architecture
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {project.solution}
              </p>
            </section>
          )}

          {/* Key Features */}
          {project.features && project.features.length > 0 && (
            <section className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Key Features & Capabilities
              </h2>
              <ul className="space-y-3">
                {project.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={18} className="text-primary-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Screenshots Gallery (Rendered only when valid screenshots exist) */}
          {project.screenshots && project.screenshots.length > 0 && (
            <section className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <ImageIcon size={20} className="text-primary-500" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Screenshots & Interface Previews
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.screenshots.map((shot, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <SafeImage
                      src={shot.url || shot}
                      alt={shot.caption || `Screenshot ${idx + 1}`}
                      className="w-full h-auto min-h-[160px] object-cover"
                      fallbackComponent={
                        <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-mono">
                          Image preview unavailable
                        </div>
                      }
                    />
                    {shot.caption && (
                      <p className="p-2 text-xs font-mono text-slate-500 text-center">{shot.caption}</p>
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
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Info Summary */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs sm:text-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Project Specification
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <div className="py-2.5 flex justify-between">
                <span className="font-medium">Category</span>
                <span className="font-mono text-slate-900 dark:text-white">{project.badge || 'Engineering'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-medium">Status</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Production Ready</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-medium">Code Availability</span>
                <span className="font-mono text-slate-900 dark:text-white">Public Repository</span>
              </div>
              {project.order && (
                <div className="py-2.5 flex justify-between">
                  <span className="font-medium">Catalog Index</span>
                  <span className="font-mono text-slate-900 dark:text-white">#{project.order}</span>
                </div>
              )}
            </div>
          </div>

          {/* Return button */}
          <Link
            to="/#projects"
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to All Projects</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
