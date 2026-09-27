import React, { useState, useEffect } from 'react';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillVisibility
} from '../../services/skillService';
import DeleteConfirmModal from './DeleteConfirmModal';
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
  RefreshCw,
  Sparkles,
  Layers,
  ArrowUpDown
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

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteConfirmSkill, setDeleteConfirmSkill] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    category: 'Programming',
    icon: 'Code',
    order: 1,
    visible: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  const fetchSkillsList = async () => {
    setLoading(true);
    try {
      const res = await getSkills({ includeHidden: true });
      setSkills(res.rawList || []);
      if (typeof onSkillChanged === 'function') {
        onSkillChanged();
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load skills catalog.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsList();
  }, []);

  const handleOpenCreate = () => {
    setEditingSkill(null);
    setFormData({
      ...initialForm,
      order: skills.length + 1,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name || '',
      category: skill.category || 'Other',
      icon: skill.icon || 'Code',
      order: skill.order || 99,
      visible: skill.visible !== false,
    });
    setFormErrors({});
    setModalOpen(true);
  };

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
          setModalOpen(false);
          await fetchSkillsList();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to update skill.' });
        }
      } else {
        // Create
        const res = await createSkill(formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `Skill "${formData.name}" added to catalog.` });
          setModalOpen(false);
          await fetchSkillsList();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to create skill.' });
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmSkill) return;
    setSaving(true);
    try {
      const res = await deleteSkill(deleteConfirmSkill.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Skill "${deleteConfirmSkill.name}" deleted.` });
        setDeleteConfirmSkill(null);
        await fetchSkillsList();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete skill.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (skill) => {
    try {
      await toggleSkillVisibility(skill.id, skill.visible);
      await fetchSkillsList();
      setFeedback({
        type: 'success',
        message: `Skill "${skill.name}" is now ${skill.visible ? 'hidden' : 'visible'}.`,
      });
    } catch (err) {
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
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Code size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Skills Management</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {skills.length} verified technologies across {CATEGORIES.length} categories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSkillsList}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh skills catalog"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
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
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by name or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading skills catalog...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Code size={24} />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">No skills found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search query or category filter.'
                : 'No skills have been cataloged yet. Click "Add Skill" above to create one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Skill Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Icon</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSkills.map((skill) => (
                  <tr
                    key={skill.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
                        {skill.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{skill.id}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {skill.category}
                      </span>
                    </td>

                    {/* Icon */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                        <Code size={14} className="text-primary-500" />
                        <span>{skill.icon || 'Code'}</span>
                      </span>
                    </td>

                    {/* Order */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit skill"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmSkill(skill)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-scale-up"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <Code size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure skill name, category group, icon, and display order
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Skill Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skill / Technology Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. TypeScript, Docker, PostgreSQL"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border ${
                    formErrors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-primary-500'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon identifier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Icon Identifier
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="skill-visible-toggle"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <label
                  htmlFor="skill-visible-toggle"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  Visible on public portfolio website
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmSkill)}
        title="Delete Skill"
        itemType="Skill"
        itemName={deleteConfirmSkill?.name}
        message="Are you sure you want to delete this skill from the portfolio catalog? It will no longer appear on your public website."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmSkill(null)}
        loading={saving}
      />
    </div>
  );
}
