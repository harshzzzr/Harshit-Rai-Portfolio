import React from 'react';

export default function LoadingState({ message = 'Loading records...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-600 rounded-full animate-spin mb-3" />
      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
        {message}
      </p>
    </div>
  );
}
