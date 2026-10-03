import React, { useState, useEffect } from 'react';
import { createProject, updateProject, uploadProjectImage } from '../../services/projectService';
import { FolderGit2, X, Upload } from 'lucide-react';

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

export default function ProjectForm({
  isOpen,
  onClose,
  editingProject,
  projectsCount = 0,
  onSaved
}) {
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title || '',
        slug: editingProject.slug || editingProject.id || '',
        tagline: editingProject.tagline || '',
        shortDescription: editingProject.shortDescription || editingProject.description || '',
        fullDescription: editingProject.fullDescription || editingProject.overview || '',
        problem: editingProject.problem || '',
        solution: editingProject.solution || '',
        features: Array.isArray(editingProject.features) ? editingProject.features.join('\n') : '',
        technologies: Array.isArray(editingProject.technologies) ? editingProject.technologies.join(', ') : '',
        badge: editingProject.badge || 'Engineering',
        order: typeof editingProject.order === 'number' ? editingProject.order : 99,
        featured: Boolean(editingProject.featured),
        visible: editingProject.visible !== false,
        githubUrl: editingProject.githubUrl || '',
        liveUrl: editingProject.liveUrl || '',
        image: editingProject.image || '',
        screenshots: editingProject.screenshots || [],
      });
    } else {
      setFormData({
        ...initialForm,
        order: projectsCount + 1,
        visible: true,
      });
    }
    setFormErrors({});
  }, [editingProject, isOpen, projectsCount]);

  if (!isOpen) return null;

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

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Project title is required.';
    if (!formData.shortDescription.trim()) errors.shortDescription = 'Short description is required.';
    if (!formData.technologies.trim()) errors.technologies = 'At least one technology is required.';
    return errors;
  };

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
        const res = await updateProject(editingProject.id, payload);
        if (res.success) {
          onSaved({ type: 'success', message: `Updated "${formData.title}" successfully.` });
          onClose();
        } else {
          setFormErrors({ submit: res.error || 'Failed to update project.' });
        }
      } else {
        const res = await createProject(payload);
        if (res.success) {
          onSaved({ type: 'success', message: `Created project "${formData.title}" successfully.` });
          onClose();
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadProjectImage(file, formData.slug || 'project');
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        onSaved({ type: 'success', message: 'Project image uploaded and optimized via Firebase Storage.' }, false);
      } else {
        setFormErrors({ image: res.error || 'Failed to upload image' });
      }
    } catch (err) {
      setFormErrors({ image: err.message || 'Image upload failed' });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
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
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Close dialog"
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
                placeholder="e.g. Campus Connect"
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
                placeholder="campus-connect"
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
              placeholder="Full-stack campus networking and academic collaboration platform"
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
                placeholder="JavaScript, Node.js, Express, React"
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
                placeholder="Web, Mobile, Systems, Hardware, Database"
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
                  Featured on Homepage
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
            {formErrors.image && <p className="text-[11px] text-rose-500">{formErrors.image}</p>}
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
              onClick={onClose}
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
  );
}
