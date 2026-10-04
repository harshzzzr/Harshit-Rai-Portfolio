import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  FolderGit2,
  Code,
  GraduationCap,
  Briefcase,
  Award,
  BookmarkCheck,
  Trophy,
  BookOpen,
  Mail,
  MessageSquareQuote,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'hackathons', label: 'Hackathons', icon: Trophy },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'certifications', label: 'Certifications', icon: BookmarkCheck },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareQuote },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ activeTab, onSelectTab, children }) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F2F1ED] dark:bg-[#0C0C0C] text-[#101112] dark:text-[#D7E2EA] flex flex-col">
      {/* Top Admin Bar - z-30 keeps it beneath modal z-50 */}
      <header className="sticky top-0 z-30 h-16 glass-navbar px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle admin sidebar"
            className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/[0.05] cursor-pointer"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Admin Brand */}
          <Link
            to="/admin"
            className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold tracking-tight text-base sm:text-lg"
          >
            <ShieldCheck size={20} className="text-primary-600 dark:text-primary-400" />
            <span>Admin Console</span>
            <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/[0.05] text-primary-600 dark:text-primary-400 border border-neutral-200 dark:border-white/10">
              v3.3
            </span>
          </Link>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public Website Shortcut */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors"
            title="View Live Public Site"
          >
            <span>Live Site</span>
            <ExternalLink size={13} />
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-neutral-700" />}
          </button>

          {/* Admin Identity */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-tight">
              {currentUser?.displayName || 'Administrator'}
            </span>
            <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 leading-tight">
              {currentUser?.email}
            </span>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            title="Log Out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar (Desktop Persistent / Mobile Drawer) - z-30 stays beneath modal z-50 */}
        <aside
          className={`fixed lg:static top-16 bottom-0 left-0 z-30 w-64 bg-[#FAF9F6] dark:bg-[#101112] border-r border-neutral-200/80 dark:border-white/10 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Nav Items */}
          <div className="p-3 space-y-1 overflow-y-auto">
            <p className="px-3 pt-2 pb-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold">
              Management Portal
            </p>
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-neutral-200/70 dark:bg-white/[0.08] text-primary-600 dark:text-primary-400 font-semibold shadow-xs border border-neutral-300/50 dark:border-white/10'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-neutral-200/80 dark:border-white/10 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
            <div className="px-3 pt-1 text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              Session: {currentUser?.isDemo ? 'Dev Session' : 'Firebase Live'}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
