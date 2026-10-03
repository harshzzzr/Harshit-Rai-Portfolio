import React, { useState, useEffect, useCallback } from 'react';
import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  toggleEducationVisibility
} from '../../services/educationService';
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
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  BookOpen,
  ListCheck
} from 'lucide-react';

export default function EducationManager({ onEducationChanged }) {
  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  const { showToast } = useAdminToast();
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [deleteConfirmEdu, setDeleteConfirmEdu] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const initialForm = {
    degree: '',
    institution: '',
    status: 'Undergraduate Student',
    order: 1,
    visible: true,
    highlights: [],
    courses: [],
  };
  const [formData, setFormData] = useState(initialForm);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(initialForm));
  const [highlightInput, setHighlightInput] = useState('');
  const [courseInput, setCourseInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchEducationList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEducation({ includeHidden: true });
      setEducationList(res.rawList || res.data || []);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load education records.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEducationList();
  }, [fetchEducationList]);

  const handleOpenCreate = () => {
    const fresh = {
      ...initialForm,
      order: educationList.length + 1,
      highlights: [],
      courses: [],
    };
    setEditingEdu(null);
    setFormData(fresh);
    setInitialSnapshot(JSON.stringify(fresh));
    setHighlightInput('');
    setCourseInput('');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (edu) => {
    const editData = {
      degree: edu.degree || '',
      institution: edu.institution || '',
      status: edu.status || 'Graduated',
      order: edu.order || 99,
      visible: edu.visible !== false,
      highlights: Array.isArray(edu.highlights) ? [...edu.highlights] : [],
      courses: Array.isArray(edu.courses) ? [...edu.courses] : [],
    };
    setEditingEdu(edu);
    setFormData(editData);
    setInitialSnapshot(JSON.stringify(editData));
    setHighlightInput('');
    setCourseInput('');
    setFormErrors({});
    setModalOpen(true);
  };

  const isDirty = JSON.stringify(formData) !== initialSnapshot;

  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData({
      ...formData,
      highlights: [...formData.highlights, highlightInput.trim()],
    });
    setHighlightInput('');
  };

  const handleRemoveHighlight = (index) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
  };

  const handleAddCourse = () => {
    if (!courseInput.trim()) return;
    setFormData({
      ...formData,
      courses: [...formData.courses, courseInput.trim()],
    });
    setCourseInput('');
  };

  const handleRemoveCourse = (index) => {
    setFormData({
      ...formData,
      courses: formData.courses.filter((_, i) => i !== index),
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.degree.trim()) errors.degree = 'Degree title is required';
    if (!formData.institution.trim()) errors.institution = 'Institution name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setFeedback(null);

    try {
      if (editingEdu) {
        // Update
        const res = await updateEducation(editingEdu.id, formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `Education record "${formData.degree}" updated.` });
          showToast({ type: 'success', message: `Education record "${formData.degree}" updated.` });
          setModalOpen(false);
          await fetchEducationList();
          if (typeof onEducationChanged === 'function') onEducationChanged();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to update record.' });
          showToast({ type: 'error', message: res.error || 'Failed to update record.' });
        }
      } else {
        // Create
        const res = await createEducation(formData);
        if (res.success) {
          setFeedback({ type: 'success', message: `Education record "${formData.degree}" added.` });
          showToast({ type: 'success', message: `Education record "${formData.degree}" added.` });
          setModalOpen(false);
          await fetchEducationList();
          if (typeof onEducationChanged === 'function') onEducationChanged();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to create record.' });
          showToast({ type: 'error', message: res.error || 'Failed to create record.' });
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
    if (!deleteConfirmEdu) return;
    setDeleteLoading(true);
    try {
      const res = await deleteEducation(deleteConfirmEdu.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Education record deleted.` });
        showToast({ type: 'success', message: `Education record deleted.` });
        setDeleteConfirmEdu(null);
        await fetchEducationList();
        if (typeof onEducationChanged === 'function') onEducationChanged();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete record.' });
        showToast({ type: 'error', message: res.error || 'Failed to delete record.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
      showToast({ type: 'error', message: err.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleVisibility = async (edu) => {
    try {
      await toggleEducationVisibility(edu.id, edu.visible);
      await fetchEducationList();
      if (typeof onEducationChanged === 'function') onEducationChanged();
      setFeedback({
        type: 'success',
        message: `Education record is now ${edu.visible ? 'hidden' : 'visible'}.`,
      });
    } catch {
      setFeedback({ type: 'error', message: 'Failed to update visibility.' });
    }
  };

  const filteredEducation = educationList.filter((edu) => {
    const q = searchQuery.toLowerCase();
    return (
      edu.degree?.toLowerCase().includes(q) ||
      edu.institution?.toLowerCase().includes(q) ||
      edu.status?.toLowerCase().includes(q)
    );
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
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Education Management</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Academic degrees, institutions, key curriculum coursework, and achievements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEducationList}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh education list"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Education</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by degree, institution, or status..."
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Education Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Loading education records...</p>
          </div>
        ) : filteredEducation.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <GraduationCap size={24} />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">No education records</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No education matching your search term.'
                : 'Click "Add Education" above to catalog a degree or academic institution.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Degree & Program</th>
                  <th className="py-3.5 px-4">Institution</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Curriculum</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEducation.map((edu) => (
                  <tr
                    key={edu.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Degree */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {edu.degree}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{edu.id}</div>
                    </td>

                    {/* Institution */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {edu.institution}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {edu.status}
                      </span>
                    </td>

                    {/* Highlights & Course summary */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <ListCheck size={13} className="text-primary-500" />
                          <span>{(edu.highlights || []).length}</span>
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="inline-flex items-center gap-1">
                          <BookOpen size={13} className="text-primary-500" />
                          <span>{(edu.courses || []).length}</span>
                        </span>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        #{edu.order}
                      </span>
                    </td>

                    {/* Visibility */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleVisibility(edu)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          edu.visible !== false
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}
                        title={edu.visible !== false ? 'Visible on portfolio. Click to hide.' : 'Hidden. Click to show.'}
                      >
                        {edu.visible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{edu.visible !== false ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(edu)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit education record"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmEdu(edu)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete education record"
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

      {/* Create / Edit Education Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEdu ? 'Edit Education Record' : 'Add Education Record'}
        description="Degree title, academic institution, core curriculum and focus areas"
        icon={GraduationCap}
        size="large"
        hasUnsavedChanges={isDirty}
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="education-editor-form"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingEdu ? 'Save Changes' : 'Create Record'}</span>
              )}
            </button>
          </>
        }
      >
        <form id="education-editor-form" onSubmit={handleSave} className="space-y-4">
              {/* Degree */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Degree / Program Title *
                </label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. Bachelor of Engineering in Computer Engineering"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border ${
                    formErrors.degree
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-primary-500'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                />
                {formErrors.degree && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.degree}</p>
                )}
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institution / University *
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g. University Name / Institute of Technology"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border ${
                    formErrors.institution
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-primary-500'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                />
                {formErrors.institution && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.institution}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Status
                  </label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    placeholder="e.g. Undergraduate Student"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
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

              {/* Highlights Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Focus & Academic Highlights ({formData.highlights.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    placeholder="Add an achievement or focus bullet point..."
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.highlights.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    {formData.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <span className="text-slate-700 dark:text-slate-300 truncate">• {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Courses Chips Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Core Coursework & Subjects ({formData.courses.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={courseInput}
                    onChange={(e) => setCourseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCourse();
                      }
                    }}
                    placeholder="e.g. Data Structures & Algorithms, DBMS..."
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCourse}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.courses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    {formData.courses.map((course, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-primary-600 dark:text-primary-400"
                      >
                        <span>{course}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(idx)}
                          className="text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="edu-visible-toggle"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <label
                  htmlFor="edu-visible-toggle"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  Visible on public portfolio website
                </label>
              </div>

        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmEdu)}
        title="Delete Education Record"
        itemType="Education Record"
        itemName={deleteConfirmEdu?.degree}
        message="Are you sure you want to delete this education record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmEdu(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
