import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, ArrowLeft, Database, KeyRound, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPlaceholder() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <ShieldCheck size={26} />
          </div>
          <div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold block">
              ● Protected Area Active
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Administrator Portal
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block font-mono">Authenticated Admin</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {currentUser?.email}
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Version Status Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary-950 text-primary-300 border border-primary-800">
          <KeyRound size={12} />
          <span>Version 3.0 Verified</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Admin Authentication Foundation Verified
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            You are securely authenticated. Unauthenticated users cannot access this route. Security rules protect Firestore and Storage endpoints at the infrastructure level.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-xs font-mono text-slate-400">Security Gate</span>
            <p className="text-sm font-semibold text-emerald-400">Protected Route Active</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-xs font-mono text-slate-400">Session Mode</span>
            <p className="text-sm font-semibold text-primary-400">
              {currentUser?.isDemo ? 'Development Session' : 'Firebase Live Auth'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-xs font-mono text-slate-400">Next Stage</span>
            <p className="text-sm font-semibold text-amber-400">v3.1 Admin Dashboard</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Return to Public Website</span>
          </Link>
          <span className="font-mono text-[11px]">Ready for v3.1 Management Controls</span>
        </div>
      </div>
    </div>
  );
}
