import React, { useState, useEffect, useCallback } from 'react';
import {
  getProjects,
  deleteProject,
  toggleProjectFeatured,
  toggleProjectVisibility
} from '../../services/projectService';
import SafeImage from '../SafeImage';
import ProjectForm from './ProjectForm';
import ConfirmDialog from './ui/ConfirmDialog';
import { useAdminToast } from './ui/AdminToast';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  FolderGit2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
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

  const { showToast } = useAdminToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null = create mode
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null); // project object to delete
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load Projects (Admin retrieves all including drafts)
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProjects({ includeHidden: true });
      setProjects(res.data || []);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load projects' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleFormSaved = async (msg, refresh = true) => {
    if (msg) setFeedback(msg);
    if (refresh) await fetchProjects();
    if (typeof onProjectChanged === 'function') onProjectChanged();
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
    } catch {
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
    } catch {
      setFeedback({ type: 'error', message: 'Could not toggle visibility state.' });
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmProject) return;

    setDeleteLoading(true);
    try {
      const res = await deleteProject(deleteConfirmProject.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Deleted "${deleteConfirmProject.title}".` });
        showToast({ type: 'success', message: `Deleted "${deleteConfirmProject.title}".` });
        setDeleteConfirmProject(null);
        await fetchProjects();
        if (typeof onProjectChanged === 'function') onProjectChanged();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete project.' });
        showToast({ type: 'error', message: res.error || 'Failed to delete project.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Delete operation failed.' });
      showToast({ type: 'error', message: err.message || 'Delete operation failed.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered & Searched Projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      ((p.shortDescription || p.description || '').toLowerCase().includes(searchQuery.toLowerCase()));

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
          role="status"
          className={`p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm font-medium border animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or technologies..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Filter Pills & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilterType('featured')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'featured'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Featured ({projects.filter((p) => p.featured).length})
            </button>
            <button
              onClick={() => setFilterType('standard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === 'standard'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Standard ({projects.filter((p) => !p.featured).length})
            </button>
          </div>

          <button
            onClick={fetchProjects}
            disabled={loading}
            title="Reload projects from Firestore"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Projects Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading project database records...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderGit2 size={36} className="text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No projects found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try clearing the search query or adjusting your filters.'
                : 'Your portfolio currently contains zero project entries. Add your first project using the button above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Order</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Technologies</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Order Index */}
                    <td className="py-3 px-4 text-center font-mono text-slate-400 font-semibold">
                      {project.order || 99}
                    </td>

                    {/* Project Title & Short Description */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {project.image ? (
                            <SafeImage
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              fallbackComponent={<ImageIcon size={18} className="text-slate-400" />}
                            />
                          ) : (
                            <ImageIcon size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {project.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {project.badge || 'Project'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                            {project.shortDescription || project.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Technologies */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(project.technologies || []).slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {(project.technologies || []).length > 3 && (
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

      {/* CREATE / EDIT MODAL COMPONENT */}
      <ProjectForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingProject={editingProject}
        projectsCount={projects.length}
        onSaved={handleFormSaved}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmProject)}
        title="Delete Project?"
        message="Are you sure you want to permanently delete this project? This will remove it from both the database and the public website immediately."
        itemName={deleteConfirmProject?.title}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmProject(null)}
      />
    </div>
  );
}
