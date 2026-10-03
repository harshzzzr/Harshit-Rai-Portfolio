import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  icon: Icon = FolderSearch,
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
