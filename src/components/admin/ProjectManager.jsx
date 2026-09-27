import React, { useState, useEffect } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectFeatured,
  toggleProjectVisibility,
  uploadProjectImage
} from '../../services/projectService';
import SafeImage from '../SafeImage';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  FolderGit2,
  Upload,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  ArrowUpDown,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectManager({ onProjectChanged }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, featured, standard
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message: '' }

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null = create mode
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null); // project object to delete

  // Form State
  const initialForm = {
    title: '',
    slug: '',
    tagline: '',
    shortDescription: '',
    fullDescription: '',
    problem: '',
    solution: '',
    features: '',
    technologies: '',
    badge: 'Featured Project',
    order: 1,
    featured: false,
    visible: true,
    githubUrl: '',
    liveUrl: '',
    image: '',
    screenshots: [],
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load Projects (Admin retrieves all including drafts)
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects({ includeHidden: true });
      setProjects(res.data || []);
      if (typeof onProjectChanged === 'function') {
        onProjectChanged();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load projects' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      ...initialForm,
      order: projects.length + 1,
      visible: true,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      slug: project.slug || project.id || '',
      tagline: project.tagline || '',
      shortDescription: project.shortDescription || project.description || '',
      fullDescription: project.fullDescription || project.overview || '',
      problem: project.problem || '',
      solution: project.solution || '',
      features: Array.isArray(project.features) ? project.features.join('\n') : '',
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
      badge: project.badge || 'Engineering',
      order: typeof project.order === 'number' ? project.order : 99,
      featured: Boolean(project.featured),
      visible: project.visible !== false,
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      image: project.image || '',
      screenshots: project.screenshots || [],
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Title change: auto-generate slug in create mode
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (!editingProject) {
        updated.slug = val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Project title is required.';
    if (!formData.shortDescription.trim()) errors.shortDescription = 'Short description is required.';
    if (!formData.technologies.trim()) errors.technologies = 'At least one technology is required.';
    return errors;
  };

  // Handle Form Submit (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setFormErrors({});

    const payload = {
      ...formData,
      features: formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      technologies: formData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      order: Number(formData.order) || 99,
    };

    try {
      if (editingProject) {
        // Update
        const res = await updateProject(editingProject.id, payload);
        if (res.success) {
          setFeedback({ type: 'success', message: `Updated "${formData.title}" successfully.` });
          setModalOpen(false);
          await fetchProjects();
        } else {
          setFormErrors({ submit: res.error || 'Failed to update project.' });
        }
      } else {
        // Create
        const res = await createProject(payload);
        if (res.success) {
          setFeedback({ type: 'success', message: `Created project "${formData.title}" successfully.` });
          setModalOpen(false);
          await fetchProjects();
        } else {
          setFormErrors({ submit: res.error || 'Failed to create project.' });
        }
      }
    } catch (err) {
      setFormErrors({ submit: err.message || 'An error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle Image Upload to Firebase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadProjectImage(file, formData.slug || 'project');
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        setFeedback({ type: 'success', message: 'Project image uploaded and optimized via Firebase Storage.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to upload image' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Image upload error' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Quick Toggle Featured
  const handleToggleFeatured = async (project) => {
    try {
      await toggleProjectFeatured(project.id, project.featured);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: !p.featured } : p))
      );
      setFeedback({
        type: 'success',
        message: `Project "${project.title}" ${!project.featured ? 'marked as Featured' : 'removed from Featured'}.`,
      });
      if (typeof onProjectChanged === 'function') onProjectChanged();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Could not toggle featured state.' });
    }
  };

  // Handle Quick Toggle Visibility (Publish / Draft)
  const handleToggleVisibility = async (project) => {
    try {
      const currentVis = project.visible !== false;
      const res = await toggleProjectVisibility(project.id, currentVis);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, visible: !currentVis } : p))
        );
        setFeedback({
          type: 'success',
          message: `Project "${project.title}" is now ${!currentVis ? 'Visible on portfolio' : 'Hidden from public view'}.`,
        });
        if (typeof onProjectChanged === 'function') onProjectChanged();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update visibility.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Could not toggle visibility state.' });
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProject) return;

    try {
      const res = await deleteProject(deleteConfirmProject.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Deleted "${deleteConfirmProject.title}".` });
        setDeleteConfirmProject(null);
        await fetchProjects();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete project.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Delete operation failed.' });
    }
  };

  // Filtered & Searched Projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'featured') return p.featured;
    if (filterType === 'standard') return !p.featured;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filters, and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-auto sm:min-w-[240px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or technologies..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilterType('featured')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'featured'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Featured ({projects.filter((p) => p.featured).length})
            </button>
          </div>
        </div>

        {/* Add Project CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProjects}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            title="Reload projects"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Table / Card Grid */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading catalog from database...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <FolderGit2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No projects found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search keywords.' : 'Get started by creating your first project entry.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Order</th>
                  <th className="py-3.5 px-4 font-semibold">Project</th>
                  <th className="py-3.5 px-4 font-semibold">Technologies</th>
                  <th className="py-3.5 px-4 font-semibold">Featured</th>
                  <th className="py-3.5 px-4 font-semibold">Visibility</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Order Index */}
                    <td className="py-3 px-4 font-mono text-slate-500">
                      #{project.order}
                    </td>

                    {/* Thumbnail + Title + Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                          {project.image ? (
                            <SafeImage
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              fallbackComponent={
                                <div className="w-full h-full flex items-center justify-center text-primary-500">
                                  <FolderGit2 size={20} />
                                </div>
                              }
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary-500">
                              <FolderGit2 size={20} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white truncate">
                              {project.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {project.badge || 'Engineering'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                            {project.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Technologies */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-[11px] font-mono text-slate-400 self-center">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                          project.featured
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Click to toggle featured status"
                      >
                        <Sparkles size={12} className={project.featured ? 'fill-current' : ''} />
                        <span>{project.featured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    {/* Visibility Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleVisibility(project)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                          project.visible !== false
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                        }`}
                        title="Click to toggle public visibility"
                      >
                        {project.visible !== false ? (
                          <>
                            <Eye size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} className="text-slate-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/projects/${project.id}`}
                          target="_blank"
                          className="p-2 rounded-lg text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View live detail page"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(project)}
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit project"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmProject(project)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <FolderGit2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingProject ? `Edit: ${editingProject.title}` : 'Add New Project'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formErrors.submit && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {formErrors.submit}
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Distributed Cache Server"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {formErrors.title && <p className="text-[11px] text-rose-500">{formErrors.title}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Slug / Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="distributed-cache-server"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="High-performance in-memory key-value store with replication"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Short Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Short Description (Listing Card) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief synopsis displayed on the home page card..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {formErrors.shortDescription && <p className="text-[11px] text-rose-500">{formErrors.shortDescription}</p>}
              </div>

              {/* Technologies & Category Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Technologies (Comma separated) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="C++, Python, Docker, Redis"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {formErrors.technologies && <p className="text-[11px] text-rose-500">{formErrors.technologies}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Systems, Web, Mobile, Hardware"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Order & Featured Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Display Order (Catalog Index)
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="visible-toggle"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor="visible-toggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Visible on Portfolio
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured-toggle"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor="featured-toggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Feature on Homepage Highlight
                    </label>
                  </div>
                </div>
              </div>

              {/* GitHub and Live Demo URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Image Upload / Asset URL */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Project Image Asset (Firebase Storage or URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL or upload via button..."
                    className="flex-1 w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0">
                    <Upload size={14} className={uploadingImage ? 'animate-bounce' : ''} />
                    <span>{uploadingImage ? 'Optimizing & Uploading...' : 'Upload Asset'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Deep Dive Fields: Full Overview, Problem, Solution */}
              <div className="space-y-1 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Project Overview (Detail Page)
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="In-depth explanation of the architecture and workflow..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Problem Statement
                  </label>
                  <textarea
                    rows={2}
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    placeholder="The challenge or bottleneck addressed..."
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Solution & Engineering
                  </label>
                  <textarea
                    rows={2}
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    placeholder="How the technical stack resolved the problem..."
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Key Features (One per line) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Features (One item per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature point 1&#10;Feature point 2&#10;Feature point 3"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Project?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{deleteConfirmProject.title}"</strong>? This will remove the project from both the database and public portfolio immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmProject(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
