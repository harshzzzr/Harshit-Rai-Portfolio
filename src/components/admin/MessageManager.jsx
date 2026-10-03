import React, { useState, useEffect, useCallback } from 'react';
import {
  getMessages,
  updateMessageStatus,
  deleteMessage,
  markMessageRead
} from '../../services/messageService';
import DeleteConfirmModal from './DeleteConfirmModal';
import AdminModal from './ui/AdminModal';
import { useAdminToast } from './ui/AdminToast';
import {
  Mail,
  MailOpen,
  Search,
  Trash2,
  Archive,
  ArchiveRestore,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ExternalLink,
  Inbox,
  Send
} from 'lucide-react';

export default function MessageManager({ onMessageChanged }) {
  const { showToast } = useAdminToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all | unread | read | archived
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Detail Modal & Delete Confirm
  const [viewingMessage, setViewingMessage] = useState(null);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMessages();
      setMessages(res.data || []);
      if (typeof onMessageChanged === 'function') {
        onMessageChanged();
      }
    } catch {
      showToast('Failed to load inbox messages.', 'error');
    } finally {
      setLoading(false);
    }
  }, [onMessageChanged, showToast]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Open Message and automatically mark read if currently unread
  const handleOpenMessage = async (msg) => {
    setViewingMessage(msg);
    if (msg.status === 'unread') {
      try {
        await markMessageRead(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' } : m))
        );
        setViewingMessage({ ...msg, status: 'read' });
        if (typeof onMessageChanged === 'function') {
          onMessageChanged();
        }
      } catch (e) {
        console.warn('Auto mark read failed:', e);
      }
    }
  };

  // Toggle Read / Unread
  const handleToggleRead = async (msg, e) => {
    if (e) e.stopPropagation();
    const newStatus = msg.status === 'unread' ? 'read' : 'unread';
    try {
      await updateMessageStatus(msg.id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m))
      );
      if (viewingMessage && viewingMessage.id === msg.id) {
        setViewingMessage({ ...viewingMessage, status: newStatus });
      }
      showToast(`Message marked as ${newStatus}.`, 'success');
      if (typeof onMessageChanged === 'function') {
        onMessageChanged();
      }
    } catch {
      showToast('Failed to update message status.', 'error');
    }
  };

  // Archive / Restore
  const handleToggleArchive = async (msg, e) => {
    if (e) e.stopPropagation();
    const newStatus = msg.status === 'archived' ? 'read' : 'archived';
    try {
      await updateMessageStatus(msg.id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m))
      );
      if (viewingMessage && viewingMessage.id === msg.id) {
        setViewingMessage({ ...viewingMessage, status: newStatus });
      }
      showToast(newStatus === 'archived' ? 'Message archived.' : 'Message restored to inbox.', 'success');
      if (typeof onMessageChanged === 'function') {
        onMessageChanged();
      }
    } catch {
      showToast('Failed to update archive status.', 'error');
    }
  };

  // Delete Message
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmMessage) return;
    setActionLoading(true);
    try {
      const res = await deleteMessage(deleteConfirmMessage.id);
      if (res.success) {
        showToast(`Message from ${deleteConfirmMessage.name} deleted.`, 'success');
        if (viewingMessage && viewingMessage.id === deleteConfirmMessage.id) {
          setViewingMessage(null);
        }
        setDeleteConfirmMessage(null);
        await fetchInbox();
      } else {
        showToast(res.error || 'Failed to delete message.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete message.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter messages
  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const readCount = messages.filter((m) => m.status === 'read').length;
  const archivedCount = messages.filter((m) => m.status === 'archived').length;

  const filteredMessages = messages.filter((msg) => {
    // Status Filter
    if (statusFilter === 'unread' && msg.status !== 'unread') return false;
    if (statusFilter === 'read' && msg.status !== 'read') return false;
    if (statusFilter === 'archived' && msg.status !== 'archived') return false;
    if (statusFilter === 'all' && msg.status === 'archived') return false; // In 'all', hide archived by default

    // Search query
    const q = searchQuery.toLowerCase();
    return (
      msg.name?.toLowerCase().includes(q) ||
      msg.email?.toLowerCase().includes(q) ||
      msg.subject?.toLowerCase().includes(q) ||
      msg.message?.toLowerCase().includes(q)
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
            <Mail size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Message Inbox</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-600 text-white font-mono">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {messages.length} inquiries received from portfolio contact form
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInbox}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh inbox"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sender, email, subject, or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Active ({messages.length - archivedCount})
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'unread'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Unread</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {unreadCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'read'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Read ({readCount})
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'archived'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Archive size={13} />
            <span>Archived ({archivedCount})</span>
          </button>
        </div>
      </div>

      {/* Messages Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Loading inbox messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox size={24} />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">No messages found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or filter tab.'
                : 'Your inbox is empty. Inquiries submitted through the contact form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-8 text-center">Status</th>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Subject & Preview</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMessages.map((msg) => {
                  const isUnread = msg.status === 'unread';

                  return (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`cursor-pointer transition-colors ${
                        isUnread
                          ? 'bg-primary-50/30 dark:bg-primary-950/20 font-medium'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Status Indicator */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            isUnread
                              ? 'bg-primary-600 dark:bg-primary-400 animate-pulse'
                              : msg.status === 'archived'
                              ? 'bg-slate-300 dark:bg-slate-600'
                              : 'bg-transparent border border-slate-300 dark:border-slate-600'
                          }`}
                          title={`Status: ${msg.status}`}
                        />
                      </td>

                      {/* Sender Name & Email */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className={`text-sm text-slate-900 dark:text-white truncate ${isUnread ? 'font-bold' : 'font-medium'}`}>
                          {msg.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {msg.email}
                        </div>
                      </td>

                      {/* Subject & Preview snippet */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className={`text-sm text-slate-900 dark:text-white truncate ${isUnread ? 'font-bold' : 'font-medium'}`}>
                          {msg.subject}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {msg.message}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {formatDate(msg.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1">
                          {/* Open detail */}
                          <button
                            onClick={() => handleOpenMessage(msg)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Open message details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Toggle Read */}
                          <button
                            onClick={(e) => handleToggleRead(msg, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={isUnread ? 'Mark as read' : 'Mark as unread'}
                          >
                            {isUnread ? <MailOpen size={15} /> : <Mail size={15} />}
                          </button>

                          {/* Archive */}
                          <button
                            onClick={(e) => handleToggleArchive(msg, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={msg.status === 'archived' ? 'Restore to active' : 'Archive message'}
                          >
                            {msg.status === 'archived' ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmMessage(msg);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete message"
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

      {/* Message Detail View Modal */}
      <AdminModal
        isOpen={Boolean(viewingMessage)}
        onClose={() => setViewingMessage(null)}
        title={viewingMessage ? viewingMessage.subject : 'Message Details'}
        description={
          viewingMessage
            ? `From ${viewingMessage.name} (${viewingMessage.email}) • ${formatDate(viewingMessage.createdAt)}`
            : ''
        }
        icon={Mail}
        size="large"
        footer={
          viewingMessage && (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                {/* Toggle Read */}
                <button
                  type="button"
                  onClick={() => handleToggleRead(viewingMessage)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {viewingMessage.status === 'unread' ? <MailOpen size={14} /> : <Mail size={14} />}
                  <span>{viewingMessage.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}</span>
                </button>

                {/* Archive / Restore */}
                <button
                  type="button"
                  onClick={() => handleToggleArchive(viewingMessage)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {viewingMessage.status === 'archived' ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                  <span>{viewingMessage.status === 'archived' ? 'Restore' : 'Archive'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmMessage(viewingMessage);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )
        }
      >
        {viewingMessage && (
          <div className="space-y-4">
            {/* Sender Details Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {viewingMessage.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {viewingMessage.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {viewingMessage.email}
                  </div>
                </div>
              </div>

              {/* Direct Reply Link */}
              <a
                href={`mailto:${viewingMessage.email}?subject=Re: ${encodeURIComponent(viewingMessage.subject)}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors shadow-xs w-fit"
              >
                <Send size={13} />
                <span>Reply via Email</span>
                <ExternalLink size={11} />
              </a>
            </div>

            {/* Message Body Content */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Message Content
              </span>
              <div className="p-5 rounded-xl bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {viewingMessage.message}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmMessage)}
        title="Delete Message"
        itemType="Message"
        itemName={deleteConfirmMessage ? `${deleteConfirmMessage.name}: "${deleteConfirmMessage.subject}"` : ''}
        message="Are you sure you want to permanently delete this message inquiry? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmMessage(null)}
        loading={actionLoading}
      />
    </div>
  );
}
