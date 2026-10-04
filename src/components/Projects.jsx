import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getProjects } from '../services/projectService';
import ProjectCard from './ProjectCard';
import { RefreshCw, AlertCircle, FolderX, Search, X, Sparkles, RotateCcw } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTechnology, setSelectedTechnology] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProjects();
      setProjects(res.data || []);
      setError(res.error || null);
      setIsLive(Boolean(res.isLive));
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Dynamically extract categories that ACTUALLY exist in the project data
  const availableCategories = useMemo(() => {
    const categorySet = new Set();
    projects.forEach((p) => {
      if (p.category && typeof p.category === 'string') {
        categorySet.add(p.category.trim());
      }
    });
    return ['all', ...Array.from(categorySet)];
  }, [projects]);

  // Dynamically extract technologies that ACTUALLY exist in the project data
  const availableTechnologies = useMemo(() => {
    const techSet = new Set();
    projects.forEach((p) => {
      if (Array.isArray(p.technologies)) {
        p.technologies.forEach((t) => {
          if (t && typeof t === 'string') {
            techSet.add(t.trim());
          }
        });
      }
    });
    return ['all', ...Array.from(techSet).sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  // Combined Search & Multi-Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // 1. Featured Filter
      if (featuredOnly && !project.featured) {
        return false;
      }

      // 2. Category Filter
      if (
        selectedCategory !== 'all' &&
        (project.category || '').toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // 3. Technology Filter
      if (selectedTechnology !== 'all') {
        const projectTechs = (project.technologies || []).map((t) => (t || '').toLowerCase());
        if (!projectTechs.includes(selectedTechnology.toLowerCase())) {
          return false;
        }
      }

      // 4. Search Filter (searches title, description, technologies, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (project.title || '').toLowerCase().includes(q);
        const matchDesc = (project.description || project.shortDescription || project.overview || '').toLowerCase().includes(q);
        const matchCategory = (project.category || '').toLowerCase().includes(q);
        const matchTech = (project.technologies || []).some((t) =>
          (t || '').toLowerCase().includes(q)
        );

        if (!matchTitle && !matchDesc && !matchCategory && !matchTech) {
          return false;
        }
      }

      return true;
    });
  }, [projects, featuredOnly, selectedCategory, selectedTechnology, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedTechnology !== 'all' ||
    featuredOnly;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTechnology('all');
    setFeaturedOnly(false);
  };

  // Determine empty state message based on active controls
  const getEmptyStateMessage = () => {
    if (projects.length === 0) {
      return {
        title: 'No Projects Available',
        description: 'No portfolio projects have been loaded yet.',
      };
    }
    if (searchQuery.trim() && !featuredOnly && selectedCategory === 'all' && selectedTechnology === 'all') {
      return {
        title: 'No Projects Found',
        description: 'No projects found. Try another search.',
      };
    }
    if (!searchQuery.trim() && (featuredOnly || selectedCategory !== 'all' || selectedTechnology !== 'all')) {
      return {
        title: 'No Projects Found',
        description: 'No projects found. Try another filter.',
      };
    }
    return {
      title: 'No Projects Found',
      description: 'No projects match your search and filter criteria. Try clearing filters.',
    };
  };

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-black/5 dark:border-white/10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium bg-white dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-[#D7E2EA] mb-1 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-primary-500'}`} />
            <span>{isLive ? 'Cloud Firestore Live Data' : 'Structured Data Feed'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#101112] dark:text-[#D7E2EA] font-sans">
            Featured Projects
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-[#D7E2EA]/75 max-w-xl mx-auto">
            Practical software implementations loaded asynchronously from our data architecture.
          </p>
          <div className="w-12 h-0.5 bg-primary-500 mx-auto rounded-xs mt-2" />
        </div>

        {/* Search & Multi-Filter Controls */}
        {!loading && !error && projects.length > 0 && (
          <div className="space-y-4">
            {/* Top Row: Search Input & Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1" role="search">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-[#D7E2EA]/40 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  aria-label="Search projects by title, description, category, or technology"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-[#101112] dark:text-[#D7E2EA] placeholder-neutral-400 dark:placeholder-[#D7E2EA]/40 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-primary-500 shadow-xs transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-[#D7E2EA] p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Secondary Selectors (Tech Dropdown & Featured Toggle) */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Technology Selector */}
                {availableTechnologies.length > 1 && (
                  <div className="relative flex items-center">
                    <label htmlFor="tech-filter" className="sr-only">
                      Filter by Technology
                    </label>
                    <select
                      id="tech-filter"
                      value={selectedTechnology}
                      onChange={(e) => setSelectedTechnology(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA] text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary-500 shadow-xs cursor-pointer"
                    >
                      <option value="all">All Technologies</option>
                      {availableTechnologies
                        .filter((t) => t !== 'all')
                        .map((tech) => (
                          <option key={tech} value={tech}>
                            {tech}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Featured Status Toggle */}
                <button
                  type="button"
                  onClick={() => setFeaturedOnly((prev) => !prev)}
                  aria-pressed={featuredOnly}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    featuredOnly
                      ? 'bg-amber-500 text-white shadow-amber-500/20'
                      : 'bg-white dark:bg-[#101112] text-neutral-700 dark:text-[#D7E2EA] border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-[#141516]'
                  }`}
                >
                  <Sparkles size={13} className={featuredOnly ? 'text-white' : 'text-amber-500'} />
                  <span>Featured Only</span>
                </button>

                {/* Clear Filters Button (Visible when filters are active) */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Row: Category Pills Bar */}
            <div
              role="group"
              aria-label="Filter projects by category"
              className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar"
            >
              {availableCategories.map((category) => {
                const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
                const count =
                  category === 'all'
                    ? projects.length
                    : projects.filter(
                        (p) => (p.category || '').toLowerCase() === category.toLowerCase()
                      ).length;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={isSelected}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      isSelected
                        ? 'bg-neutral-900 text-white dark:bg-[#D7E2EA] dark:text-[#0C0C0C] font-semibold shadow-xs'
                        : 'bg-white dark:bg-[#101112] text-neutral-700 dark:text-[#D7E2EA]/85 border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-[#141516]'
                    }`}
                  >
                    <span className="capitalize">{category === 'all' ? 'All Categories' : category}</span>
                    <span className="ml-1.5 opacity-70 font-mono text-[11px]">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Result summary count when filters are active */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-[#D7E2EA]/60 px-1">
                <span>
                  Showing <strong className="text-neutral-800 dark:text-[#D7E2EA]">{filteredProjects.length}</strong> of{' '}
                  {projects.length} projects
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                >
                  Reset all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((skeletonId) => (
              <div
                key={skeletonId}
                className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] p-4 space-y-4 motion-safe:animate-pulse"
              >
                <div className="h-44 w-full bg-neutral-200 dark:bg-[#141516] rounded-lg" />
                <div className="space-y-2">
                  <div className="h-6 w-3/4 bg-neutral-200 dark:bg-[#141516] rounded" />
                  <div className="h-4 w-full bg-neutral-200 dark:bg-[#141516] rounded" />
                  <div className="h-4 w-2/3 bg-neutral-200 dark:bg-[#141516] rounded" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-16 bg-neutral-200 dark:bg-[#141516] rounded" />
                  <div className="h-6 w-16 bg-neutral-200 dark:bg-[#141516] rounded" />
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
                Failed to load projects
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {error}
              </p>
            </div>
            <button
              onClick={fetchProjects}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Meaningful Empty States for Search & Filters */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-white/10 max-w-lg mx-auto space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-[#141516] text-neutral-500 mx-auto flex items-center justify-center">
              <FolderX size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#101112] dark:text-[#D7E2EA]">
              {getEmptyStateMessage().title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-[#D7E2EA]/60 max-w-sm mx-auto">
              {getEmptyStateMessage().description}
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <RotateCcw size={13} />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div
            id="projects-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
