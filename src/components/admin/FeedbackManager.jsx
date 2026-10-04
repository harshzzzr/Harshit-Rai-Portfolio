import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllFeedback,
  approveFeedback,
  rejectFeedback,
  toggleFeaturedFeedback,
  deleteFeedback
} from '../../services/feedbackService';
import DeleteConfirmModal from './DeleteConfirmModal';
import AdminModal from './ui/AdminModal';
import { useAdminToast } from './ui/AdminToast';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  X,
  MessageSquareQuote,
  Sparkles,
  Search,
  Check,
  Ban
} from 'lucide-react';

export default function FeedbackManager({ onFeedbackChanged }) {
  const { showToast } = useAdminToast();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // default to pending for moderation
  const [searchQuery, setSearchQuery] = useState('');
  const [banner, setBanner] = useState(null);

  // Detail Modal & Delete Confirm
  const [viewingItem, setViewingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllFeedback();
      setFeedbackList(res.data || []);
    } catch {
      showToast('Failed to load feedback records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Compute stats
  const counts = {
    total: feedbackList.length,
    pending: feedbackList.filter((i) => i.status === 'pending').length,
    approved: feedbackList.filter((i) => i.status === 'approved').length,
    rejected: feedbackList.filter((i) => i.status === 'rejected').length,
    featured: feedbackList.filter((i) => i.featured).length
  };

  // Filter items
  const filteredList = feedbackList.filter((item) => {
    if (statusFilter === 'pending' && item.status !== 'pending') return false;
    if (statusFilter === 'approved' && item.status !== 'approved') return false;
    if (statusFilter === 'rejected' && item.status !== 'rejected') return false;
    if (statusFilter === 'featured' && !item.featured) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchText = (item.feedback || '').toLowerCase().includes(q);
      return matchName || matchText;
    }
    return true;
  });

  // Moderation Handlers
  const handleApprove = async (item) => {
    setActionLoading(true);
    try {
      await approveFeedback(item.id);
      setFeedbackList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'approved' } : i))
      );
      if (viewingItem && viewingItem.id === item.id) {
        setViewingItem((prev) => ({ ...prev, status: 'approved' }));
      }
      showToast(`Feedback from "${item.name}" approved for public display.`, 'success');
      if (typeof onFeedbackChanged === 'function') {
        onFeedbackChanged();
      }
    } catch (err) {
      showToast(err.message || 'Failed to approve feedback.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (item) => {
    setActionLoading(true);
    try {
      await rejectFeedback(item.id);
      setFeedbackList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'rejected' } : i))
      );
      if (viewingItem && viewingItem.id === item.id) {
        setViewingItem((prev) => ({ ...prev, status: 'rejected' }));
      }
      showToast(`Feedback from "${item.name}" marked as rejected.`, 'warning');
      if (typeof onFeedbackChanged === 'function') {
        onFeedbackChanged();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reject feedback.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      const res = await toggleFeaturedFeedback(item.id, item.featured);
      const newFeatured = res.featured;
      setFeedbackList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, featured: newFeatured } : i))
      );
      if (viewingItem && viewingItem.id === item.id) {
        setViewingItem((prev) => ({ ...prev, featured: newFeatured }));
      }
      showToast(
        `Review from "${item.name}" ${
          newFeatured ? 'marked as featured' : 'removed from featured'
        }.`,
        'success'
      );
      if (typeof onFeedbackChanged === 'function') {
        onFeedbackChanged();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update featured status.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    try {
      await deleteFeedback(deleteConfirmItem.id);
      setFeedbackList((prev) => prev.filter((i) => i.id !== deleteConfirmItem.id));
      if (viewingItem && viewingItem.id === deleteConfirmItem.id) {
        setViewingItem(null);
      }
      setDeleteConfirmItem(null);
      showToast('Feedback record permanently deleted.', 'success');
      if (typeof onFeedbackChanged === 'function') {
        onFeedbackChanged();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete record.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name[0] || 'U').toUpperCase();
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Feedback & Testimonials Moderation
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 font-semibold border border-primary-500/20">
              v5.1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Review pending submissions, approve endorsements, mark featured reviews, and filter public testimonials.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alert Banner */}
      {banner && (
        <div
          className={`p-3 sm:p-4 rounded-xl text-xs sm:text-sm flex items-start justify-between gap-2 animate-fade-in ${
            banner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{banner.message}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-amber-500/60 ring-1 ring-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
              : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] hover:border-amber-400/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Pending</span>
            {counts.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {counts.pending}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'approved'
              ? 'border-emerald-500/60 ring-1 ring-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
              : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] hover:border-emerald-400/50'
          }`}
        >
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Approved</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {counts.approved}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'rejected'
              ? 'border-red-500/60 ring-1 ring-red-500/30 bg-red-500/5 dark:bg-red-500/10'
              : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] hover:border-red-400/50'
          }`}
        >
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Rejected</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
            {counts.rejected}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('featured')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'featured'
              ? 'border-yellow-500/60 ring-1 ring-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-500/10'
              : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] hover:border-yellow-400/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Featured</span>
            <Star size={12} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {counts.featured}
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'all'
              ? 'border-primary-500/60 ring-1 ring-primary-500/30 bg-primary-500/5 dark:bg-primary-500/10'
              : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] hover:border-primary-400/50'
          }`}
        >
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Total Submissions</div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            {counts.total}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'pending', label: 'Pending Review', count: counts.pending },
            { id: 'approved', label: 'Approved (Public)', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
            { id: 'featured', label: 'Featured Only', count: counts.featured },
            { id: 'all', label: 'All Reviews', count: counts.total }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/15'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? 'bg-neutral-800 dark:bg-neutral-200 text-neutral-200 dark:text-neutral-800'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reviewer or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Moderation Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-sm font-mono flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-primary-500" />
            <span>Loading feedback records...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-400">
              <MessageSquareQuote size={24} />
            </div>
            <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              No Feedback Found
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              {searchQuery
                ? `No feedback matching "${searchQuery}".`
                : statusFilter === 'pending'
                ? 'No pending reviews awaiting moderation. All caught up!'
                : `No reviews found under the "${statusFilter}" category.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600 dark:text-neutral-300">
              <thead className="bg-neutral-50 dark:bg-white/5 border-b border-neutral-200 dark:border-white/10 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Feedback Quote</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Reviewer Name */}
                    <td className="py-3.5 px-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center shrink-0 border border-primary-500/20">
                          {getInitials(item.name)}
                        </div>
                        <span className="font-semibold">{item.name}</span>
                      </div>
                    </td>

                    {/* Rating Stars */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={`${
                              s <= item.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-neutral-200 dark:text-neutral-700'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-[11px] font-mono text-neutral-500 font-semibold">
                          {item.rating}/5
                        </span>
                      </div>
                    </td>

                    {/* Feedback Quote */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <p
                        onClick={() => setViewingItem(item)}
                        className="truncate text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
                        title={item.feedback}
                      >
                        "{item.feedback}"
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-400">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending
                        </span>
                      )}
                      {item.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Check size={11} />
                          Approved
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          <Ban size={11} />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Featured Star Toggle */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                          item.featured
                            ? 'text-amber-400 hover:text-amber-500 bg-amber-500/10'
                            : 'text-neutral-300 dark:text-neutral-700 hover:text-amber-400'
                        }`}
                        title={item.featured ? 'Unmark featured' : 'Mark featured'}
                      >
                        <Star
                          size={16}
                          className={item.featured ? 'fill-amber-400' : ''}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve Button */}
                        {item.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(item)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                            title="Approve for public showcase"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}

                        {/* Reject Button */}
                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(item)}
                            className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Reject testimonial"
                          >
                            <XCircle size={16} />
                          </button>
                        )}

                        {/* View Detail Modal */}
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          title="View complete feedback"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmItem(item)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete feedback"
                        >
                          <Trash2 size={16} />
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

      {/* Feedback Detail Modal */}
      <AdminModal
        isOpen={Boolean(viewingItem)}
        onClose={() => setViewingItem(null)}
        title={viewingItem ? viewingItem.name : 'Feedback Details'}
        description={viewingItem ? `Submitted on ${formatDate(viewingItem.createdAt)}` : ''}
        icon={MessageSquareQuote}
        size="medium"
        footer={
          viewingItem && (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <button
                type="button"
                onClick={() => handleToggleFeatured(viewingItem)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5 cursor-pointer"
              >
                <Star
                  size={14}
                  className={viewingItem.featured ? 'text-amber-400 fill-amber-400' : ''}
                />
                <span>{viewingItem.featured ? 'Unmark Featured' : 'Mark Featured'}</span>
              </button>

              <div className="flex items-center gap-2">
                {viewingItem.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(viewingItem)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve</span>
                  </button>
                )}

                {viewingItem.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleReject(viewingItem)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Ban size={14} />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(viewingItem)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete feedback"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        }
      >
        {viewingItem && (
          <div className="space-y-4">
            {/* Rating & Status Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#141516] border border-neutral-200 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={`${
                      s <= viewingItem.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-200 dark:text-neutral-700'
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs font-mono font-bold text-neutral-700 dark:text-neutral-200">
                  {viewingItem.rating} / 5 Stars
                </span>
              </div>

              <div className="flex items-center gap-2">
                {viewingItem.featured && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Sparkles size={11} />
                    Featured
                  </span>
                )}

                {viewingItem.status === 'pending' && (
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Pending
                  </span>
                )}
                {viewingItem.status === 'approved' && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Approved
                  </span>
                )}
                {viewingItem.status === 'rejected' && (
                  <span className="text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                    Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Feedback Body */}
            <div className="p-4 rounded-xl bg-neutral-50/60 dark:bg-[#101112] border border-neutral-200 dark:border-white/10">
              <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap italic">
                "{viewingItem.feedback}"
              </p>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmItem)}
        title="Delete Testimonial"
        itemName={deleteConfirmItem ? `Feedback from ${deleteConfirmItem.name}` : ''}
        warningMessage="Are you sure you want to delete this feedback submission? This record will be permanently removed."
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </div>
  );
}
