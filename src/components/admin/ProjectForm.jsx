import React, { useState, useEffect, useMemo } from 'react';
import { createProject, updateProject, uploadProjectImage } from '../../services/projectService';
import { FolderGit2, Upload, AlertCircle } from 'lucide-react';
import AdminModal from './ui/AdminModal';

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
  onSaved,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initialForm));
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let baseline;
    if (editingProject) {
      baseline = {
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
      };
    } else {
      baseline = {
        ...initialForm,
        order: projectsCount + 1,
        visible: true,
      };
    }
    setFormData(baseline);
    setInitialSnapshot(JSON.stringify(baseline));
    setFormErrors({});
  }, [editingProject, isOpen, projectsCount]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== initialSnapshot;
  }, [formData, initialSnapshot]);

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

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="project-editor-form"
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
      >
        {saving ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
        )}
      </button>
    </>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProject ? `Edit: ${editingProject.title}` : 'Add New Project'}
      description="Configure architecture, technologies, problem-solution statements, and repository URLs"
      icon={FolderGit2}
      size="large"
      hasUnsavedChanges={isDirty}
      footer={modalFooter}
    >
      <form id="project-editor-form" onSubmit={handleSave} className="space-y-5">
        {formErrors.submit && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formErrors.submit}</span>
          </div>
        )}

        {/* 1. Core Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g. Drone Detection System"
              className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-[#101112] border ${
                formErrors.title ? 'border-red-500' : 'border-neutral-200 dark:border-white/10'
              } text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
            {formErrors.title && <p className="text-[11px] text-red-500">{formErrors.title}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="drone-detection-system"
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 2. Tagline */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Tagline / Focus Headline
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="Real-Time Aerial Surveillance & Acoustic Signal Classifier"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 3. Short Description */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Short Description (Grid card preview) *
          </label>
          <textarea
            rows={2}
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            placeholder="Brief overview explaining what the project achieves..."
            className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-[#101112] border ${
              formErrors.shortDescription ? 'border-red-500' : 'border-neutral-200 dark:border-white/10'
            } text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500`}
          />
          {formErrors.shortDescription && (
            <p className="text-[11px] text-red-500">{formErrors.shortDescription}</p>
          )}
        </div>

        {/* 4. Full Overview */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Full Description (Detail page architecture overview)
          </label>
          <textarea
            rows={3}
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            placeholder="Detailed architectural summary and engineering methodology..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 5. Technologies */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Technologies (comma-separated) *
          </label>
          <input
            type="text"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            placeholder="C++, OpenCV, PyTorch, React, WebSockets"
            className={`w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-xl bg-neutral-50 dark:bg-[#101112] border ${
              formErrors.technologies ? 'border-red-500' : 'border-neutral-200 dark:border-white/10'
            } text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500`}
          />
          {formErrors.technologies && (
            <p className="text-[11px] text-red-500">{formErrors.technologies}</p>
          )}
        </div>

        {/* 6. URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/harshzzzr/repository"
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Live Demo / Product URL
            </label>
            <input
              type="url"
              value={formData.liveUrl}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              placeholder="https://my-app.example.com (optional)"
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 7. Image Upload */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Project Banner Image (URL or Firebase Storage upload)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="/images/projects/banner.png or https://..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm font-mono rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/[0.05] hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 text-xs font-semibold cursor-pointer transition-colors border border-neutral-300 dark:border-white/10 shrink-0">
              <Upload size={14} />
              <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        {/* 8. Badge, Order, Featured, Visible */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/80 dark:border-white/05">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              Category Badge
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              Display Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="proj-featured-toggle"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-white/10 cursor-pointer"
            />
            <label
              htmlFor="proj-featured-toggle"
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
            >
              Featured
            </label>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="proj-visible-toggle"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-white/10 cursor-pointer"
            />
            <label
              htmlFor="proj-visible-toggle"
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
            >
              Published
            </label>
          </div>
        </div>

        {/* 9. Problem & Solution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Problem Statement
            </label>
            <textarea
              rows={2}
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              placeholder="The challenge or bottleneck addressed..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Solution & Engineering
            </label>
            <textarea
              rows={2}
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              placeholder="How the technical stack resolved the problem..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 10. Key Features */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Key Features (One item per line)
          </label>
          <textarea
            rows={3}
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            placeholder="Feature point 1&#10;Feature point 2&#10;Feature point 3"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </form>
    </AdminModal>
  );
}
