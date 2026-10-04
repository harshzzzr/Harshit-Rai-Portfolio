import React, { useState, useEffect, useCallback } from 'react';
import {
  getTimelineData,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
  toggleTimelineItemVisibility
} from '../../services/timelineService';
import DeleteConfirmModal from './DeleteConfirmModal';
import AdminModal from './ui/AdminModal';
import { useAdminToast } from './ui/AdminToast';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
  Trophy,
  BookOpen,
  Award,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

const TIMELINE_TYPES = [
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'certifications', label: 'Certifications', icon: BookmarkCheck },
];

export default function TimelineManager({ initialType = 'experience', onTimelineChanged }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTypeFilter, setActiveTypeFilter] = useState(initialType || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Sync filter when initialType prop changes (e.g. user clicked another sidebar tab)
  useEffect(() => {
    if (initialType) {
      setActiveTypeFilter(initialType);
    }
  }, [initialType]);

  const { showToast } = useAdminToast();
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const initialForm = {
    type: initialType && initialType !== 'all' ? initialType : 'experience',
    title: '',
    role: '',
    organization: '',
    period: '',
    description: '',
    order: 1,
    visible: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initialForm));
  const [formErrors, setFormErrors] = useState({});

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTimelineData({ includeHidden: true });
      setItems(res.rawList || []);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load milestones catalog.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    const targetType = activeTypeFilter !== 'all' ? activeTypeFilter : 'experience';
    const typeItems = items.filter((i) => i.type === targetType);
    const fresh = {
      ...initialForm,
      type: targetType,
      order: typeItems.length + 1,
    };
    setFormData(fresh);
    setInitialSnapshot(JSON.stringify(fresh));
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const editData = {
      type: item.type || 'experience',
      title: item.title || '',
      role: item.role || '',
      organization: item.organization || '',
      period: item.period || '',
      description: item.description || '',
      order: item.order || 99,
      visible: item.visible !== false,
    };
    setFormData(editData);
    setInitialSnapshot(JSON.stringify(editData));
    setFormErrors({});
    setModalOpen(true);
  };

  const isDirty = JSON.stringify(formData) !== initialSnapshot;

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.role.trim()) errors.role = 'Role / Subtitle is required';
    if (!formData.type) errors.type = 'Category type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setFeedback(null);

    try {
      if (editingItem) {
        // Update
        const res = await updateTimelineItem(editingItem.id, formData);
        if (res.success) {
          showToast(`Milestone "${formData.title}" updated.`, 'success');
          setModalOpen(false);
          await fetchTimeline();
          if (typeof onTimelineChanged === 'function') onTimelineChanged();
        } else {
          showToast(res.error || 'Failed to update milestone.', 'error');
        }
      } else {
        // Create
        const res = await createTimelineItem(formData);
        if (res.success) {
          showToast(`Milestone "${formData.title}" added to catalog.`, 'success');
          setModalOpen(false);
          await fetchTimeline();
          if (typeof onTimelineChanged === 'function') onTimelineChanged();
        } else {
          showToast(res.error || 'Failed to create milestone.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Operation failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    setDeleteLoading(true);
    try {
      const res = await deleteTimelineItem(deleteConfirmItem.id);
      if (res.success) {
        showToast(`Milestone "${deleteConfirmItem.title}" deleted.`, 'success');
        setDeleteConfirmItem(null);
        await fetchTimeline();
        if (typeof onTimelineChanged === 'function') onTimelineChanged();
      } else {
        showToast(res.error || 'Failed to delete milestone.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete milestone.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleVisibility = async (item) => {
    try {
      await toggleTimelineItemVisibility(item.id, item.visible);
      await fetchTimeline();
      if (typeof onTimelineChanged === 'function') onTimelineChanged();
      showToast(
        `Milestone "${item.title}" is now ${item.visible ? 'hidden' : 'visible'}.`,
        'success'
      );
    } catch {
      showToast('Failed to update visibility.', 'error');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesType = activeTypeFilter === 'all' || item.type === activeTypeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(q) ||
      item.role?.toLowerCase().includes(q) ||
      item.organization?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const currentTypeConfig = TIMELINE_TYPES.find((t) => t.id === activeTypeFilter);
  const CurrentIcon = currentTypeConfig ? currentTypeConfig.icon : Layers;
  const currentLabel = currentTypeConfig ? currentTypeConfig.label : 'All Milestones';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#101112] p-4 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 flex items-center justify-center">
            <CurrentIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {currentLabel} Management
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {filteredItems.length} entries cataloged in {currentLabel.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTimeline}
            disabled={loading}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Refresh milestones list"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Type Selector Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, role, organization..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Milestone Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTypeFilter === 'all'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#101112] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'
            }`}
          >
            All ({items.length})
          </button>

          {TIMELINE_TYPES.map((typeObj) => {
            const Icon = typeObj.icon;
            const count = items.filter((i) => i.type === typeObj.id).length;
            const isActive = activeTypeFilter === typeObj.id;

            return (
              <button
                key={typeObj.id}
                onClick={() => setActiveTypeFilter(typeObj.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#101112] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'
                }`}
              >
                <Icon size={13} />
                <span>{typeObj.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Items Data Table */}
      <div className="bg-white dark:bg-[#101112] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Loading milestones...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-200 dark:border-white/10">
              <CurrentIcon size={24} />
            </div>
            <p className="text-base font-bold text-neutral-900 dark:text-white">No entries found</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search query.'
                : `No ${currentLabel.toLowerCase()} entries have been added yet. Click "Add Entry" to create one.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-white/5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Title & Context</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Role / Organization</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {filteredItems.map((item) => {
                  const typeObj = TIMELINE_TYPES.find((t) => t.id === item.type);
                  const Icon = typeObj?.icon || Sparkles;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Title & Description preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-neutral-900 dark:text-white text-sm">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        )}
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{item.id}</div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
                          <Icon size={12} className="text-primary-500" />
                          <span className="capitalize">{item.type}</span>
                        </span>
                      </td>

                      {/* Role & Organization */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                          {item.role || 'N/A'}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {item.organization || 'Independent'}
                        </div>
                      </td>

                      {/* Period */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                          <Calendar size={12} className="text-neutral-400" />
                          <span>{item.period || 'Continuous'}</span>
                        </span>
                      </td>

                      {/* Order */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block text-xs font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
                          #{item.order}
                        </span>
                      </td>

                      {/* Visibility */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleVisibility(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            item.visible !== false
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-white/10'
                          }`}
                          title={item.visible !== false ? 'Visible on portfolio. Click to hide.' : 'Hidden. Click to show.'}
                        >
                          {item.visible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{item.visible !== false ? 'Visible' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Edit milestone"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem(item)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete milestone"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Milestone Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Milestone Entry' : 'Add Milestone Entry'}
        description="Provide title, role, organization, timeline duration and overview"
        icon={CurrentIcon}
        size="large"
        hasUnsavedChanges={isDirty}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="timeline-form"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingItem ? 'Save Changes' : 'Create Entry'}</span>
              )}
            </button>
          </div>
        }
      >
        <form id="timeline-form" onSubmit={handleSave} className="space-y-4">
          {/* Category Type */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Milestone Category Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {TIMELINE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Title / Milestone Headline *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Engineering Hackathon Participant, Systems Research Paper"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#101112] border ${
                formErrors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-white/10 focus:ring-primary-500'
              } text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2`}
            />
            {formErrors.title && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Role / Subtitle *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Student Developer, Researcher"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#101112] border ${
                  formErrors.role
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-200 dark:border-white/10 focus:ring-primary-500'
                } text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2`}
              />
              {formErrors.role && (
                <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.role}</p>
              )}
            </div>

            {/* Organization */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Organization / Platform
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. University Lab, Independent"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Period */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Period / Timeframe
              </label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="e.g. Academic Trajectory, 2025"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Description / Details
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summarize key tasks, findings, outcomes, or awards..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Visibility Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10">
            <input
              type="checkbox"
              id="timeline-visible-toggle"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-700 cursor-pointer"
            />
            <label
              htmlFor="timeline-visible-toggle"
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
            >
              Visible on public portfolio website
            </label>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmItem)}
        title="Delete Milestone Entry"
        itemType="Milestone Entry"
        itemName={deleteConfirmItem?.title}
        message="Are you sure you want to permanently delete this milestone entry? It will be removed from your timeline."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmItem(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
