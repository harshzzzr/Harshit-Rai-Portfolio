import React, { useState, useEffect, useCallback } from 'react';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillVisibility
} from '../../services/skillService';
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
  Code,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Database',
  'Tools',
  'Mobile',
  'Other'
];

const COMMON_ICONS = ['Code', 'Globe', 'Database', 'Wrench', 'Smartphone', 'Cpu', 'Layers', 'Terminal', 'Server'];

export default function SkillManager({ onSkillChanged }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedback, setFeedback] = useState(null);

  const { showToast } = useAdminToast();
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteConfirmSkill, setDeleteConfirmSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    category: 'Programming',
    icon: 'Code',
    order: 1,
    visible: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initialForm));
  const [formErrors, setFormErrors] = useState({});

  const fetchSkillsList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSkills({ includeHidden: true });
      setSkills(res.rawList || []);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load skills catalog.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkillsList();
  }, [fetchSkillsList]);

  const handleOpenCreate = () => {
    const fresh = {
      ...initialForm,
      order: skills.length + 1,
    };
    setEditingSkill(null);
    setFormData(fresh);
    setInitialSnapshot(JSON.stringify(fresh));
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (skill) => {
    const editData = {
      name: skill.name || '',
      category: skill.category || 'Other',
      icon: skill.icon || 'Code',
      order: skill.order || 99,
      visible: skill.visible !== false,
    };
    setEditingSkill(skill);
    setFormData(editData);
    setInitialSnapshot(JSON.stringify(editData));
    setFormErrors({});
    setModalOpen(true);
  };

  const isDirty = JSON.stringify(formData) !== initialSnapshot;

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Skill name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setFeedback(null);

    try {
      if (editingSkill) {
        // Update
        const res = await updateSkill(editingSkill.id, formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `Skill "${formData.name}" updated successfully.` });
          showToast({ type: 'success', message: `Skill "${formData.name}" updated successfully.` });
          setModalOpen(false);
          await fetchSkillsList();
          if (typeof onSkillChanged === 'function') onSkillChanged();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to update skill.' });
          showToast({ type: 'error', message: res.error || 'Failed to update skill.' });
        }
      } else {
        // Create
        const res = await createSkill(formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `Skill "${formData.name}" added to catalog.` });
          showToast({ type: 'success', message: `Skill "${formData.name}" added to catalog.` });
          setModalOpen(false);
          await fetchSkillsList();
          if (typeof onSkillChanged === 'function') onSkillChanged();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to create skill.' });
          showToast({ type: 'error', message: res.error || 'Failed to create skill.' });
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
      showToast({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmSkill) return;
    setDeleteLoading(true);
    try {
      const res = await deleteSkill(deleteConfirmSkill.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Skill "${deleteConfirmSkill.name}" deleted.` });
        showToast({ type: 'success', message: `Skill "${deleteConfirmSkill.name}" deleted.` });
        setDeleteConfirmSkill(null);
        await fetchSkillsList();
        if (typeof onSkillChanged === 'function') onSkillChanged();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete skill.' });
        showToast({ type: 'error', message: res.error || 'Failed to delete skill.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
      showToast({ type: 'error', message: err.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleVisibility = async (skill) => {
    try {
      await toggleSkillVisibility(skill.id, skill.visible);
      await fetchSkillsList();
      if (typeof onSkillChanged === 'function') onSkillChanged();
      setFeedback({
        type: 'success',
        message: `Skill "${skill.name}" is now ${skill.visible ? 'hidden' : 'visible'}.`,
      });
    } catch (_err) {
      setFeedback({ type: 'error', message: 'Failed to update visibility.' });
    }
  };

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#101112] p-4 rounded-2xl border border-neutral-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/40 flex items-center justify-center">
            <Code size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Skills Management</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {skills.length} verified technologies across {CATEGORIES.length} categories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSkillsList}
            disabled={loading}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Refresh skills catalog"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by name or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#101112] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/[0.04]'
            }`}
          >
            All ({skills.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = skills.filter((s) => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#101112] text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills Data Table */}
      <div className="bg-white dark:bg-[#101112] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Loading skills catalog...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-white/[0.04] text-neutral-400 flex items-center justify-center mx-auto">
              <Code size={24} />
            </div>
            <p className="text-base font-bold text-neutral-900 dark:text-white">No skills found</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search query or category filter.'
                : 'No skills have been cataloged yet. Click "Add Skill" above to create one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-[#141516] text-xs font-semibold text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Skill Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Icon</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/05">
                {filteredSkills.map((skill) => (
                  <tr
                    key={skill.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white font-mono text-sm">
                        {skill.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">{skill.id}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-white/[0.05] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10">
                        {skill.category}
                      </span>
                    </td>

                    {/* Icon */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                        <Code size={14} className="text-primary-500" />
                        <span>{skill.icon || 'Code'}</span>
                      </span>
                    </td>

                    {/* Order */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-white/[0.05] text-neutral-600 dark:text-neutral-300">
                        #{skill.order}
                      </span>
                    </td>

                    {/* Visibility */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleVisibility(skill)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                          skill.visible !== false
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-neutral-100 dark:bg-white/[0.04] text-neutral-500 border border-neutral-200 dark:border-white/10'
                        }`}
                        title={skill.visible !== false ? 'Visible on portfolio. Click to hide.' : 'Hidden from portfolio. Click to show.'}
                      >
                        {skill.visible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{skill.visible !== false ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(skill)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                          title="Edit skill"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmSkill(skill)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete skill"
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

      {/* Create / Edit Skill Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        description="Configure skill name, category group, icon, and display order"
        icon={Code}
        size="medium"
        hasUnsavedChanges={isDirty}
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="skill-editor-form"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingSkill ? 'Save Changes' : 'Create Skill'}</span>
              )}
            </button>
          </>
        }
      >
        <form id="skill-editor-form" onSubmit={handleSave} className="space-y-4">
          {/* Skill Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Skill / Technology Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. TypeScript, Docker, PostgreSQL"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#101112] border ${
                formErrors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-white/10 focus:ring-primary-500'
              } text-neutral-900 dark:text-[#D7E2EA] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2`}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Icon identifier */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Icon Identifier
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {COMMON_ICONS.map((ico) => (
                  <option key={ico} value={ico}>
                    {ico}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-[#D7E2EA] focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Visibility Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/05">
            <input
              type="checkbox"
              id="skill-visible-toggle"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-white/10 cursor-pointer"
            />
            <label
              htmlFor="skill-visible-toggle"
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
            >
              Visible on public portfolio website
            </label>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmSkill)}
        title="Delete Skill"
        itemType="Skill"
        itemName={deleteConfirmSkill?.name}
        message="Are you sure you want to delete this skill from the portfolio catalog? It will no longer appear on your public website."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmSkill(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
