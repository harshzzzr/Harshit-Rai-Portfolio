import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { getProjects } from '../services/projectService';
import { getSkills } from '../services/skillService';
import { getEducation, getTimelineData } from '../services/timelineService';
import { getMessageCount } from '../services/messageService';
import { getAllFeedback } from '../services/feedbackService';
import {
  FolderGit2,
  Code,
  Mail,
  MessageSquareQuote,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  Sliders,
  BarChart3,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectManager from '../components/admin/ProjectManager';
import SkillManager from '../components/admin/SkillManager';
import EducationManager from '../components/admin/EducationManager';
import TimelineManager from '../components/admin/TimelineManager';
import MessageManager from '../components/admin/MessageManager';
import FeedbackManager from '../components/admin/FeedbackManager';
import AnalyticsManager from '../components/admin/AnalyticsManager';
import { getAnalyticsSummary } from '../services/analyticsService';
import SEO from '../components/SEO';
import { useAdminToast } from '../components/admin/ui/AdminToast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SITE_CONFIG } from '../config/site';
import AdminErrorBoundary from '../components/admin/ui/AdminErrorBoundary';

export default function AdminDashboardPage() {
  const { showToast } = useAdminToast();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [counts, setCounts] = useState({
    projects: 0,
    featuredProjects: 0,
    skills: 0,
    skillCategories: 0,
    education: 0,
    experience: 0,
    hackathons: 0,
    research: 0,
    achievements: 0,
    certifications: 0,
    messages: 0,
    feedback: 0,
    pageViews: 0,
    uniqueSessions: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [skillCategoriesList, setSkillCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Projects
      const projRes = await getProjects();
      const projectList = projRes.data || [];
      const featuredCount = projectList.filter((p) => p.featured).length;

      // 2. Skills
      const skillRes = await getSkills();
      const skillCats = skillRes.data || [];
      const totalSkills = skillCats.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);

      // 3. Education
      const eduRes = await getEducation();
      const eduList = eduRes.data || [];

      // 4. Timeline
      const timeRes = await getTimelineData();
      const timeData = timeRes.data || {};

      // 5. Messages count & Feedback count
      const messagesCount = await getMessageCount();
      const fbRes = await getAllFeedback();
      const feedbackCount = (fbRes.data || []).length;

      // 6. Analytics summary
      const analyticsSummary = await getAnalyticsSummary(14);

      setCounts({
        projects: projectList.length,
        featuredProjects: featuredCount,
        skills: totalSkills,
        skillCategories: skillCats.length,
        education: eduList.length,
        experience: (timeData.experience || []).length,
        hackathons: (timeData.hackathons || []).length,
        research: (timeData.research || []).length,
        achievements: (timeData.achievements || []).length,
        certifications: (timeData.certifications || []).length,
        messages: messagesCount,
        feedback: feedbackCount,
        pageViews: analyticsSummary?.totalPageViews || 0,
        uniqueSessions: analyticsSummary?.uniqueSessions || 0,
      });

      setRecentProjects(projectList.slice(0, 4));
      setSkillCategoriesList(skillCats);
    } catch (err) {
      console.error('[Admin] Error loading counts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResetDashboardView = async () => {
    setActiveTab('dashboard');
    await fetchDashboardData();
    showToast('Dashboard view and metrics have been reset.', 'info');
  };

  const handleResetAdminPreferences = () => {
    try {
      localStorage.removeItem('admin_filter_cache');
      localStorage.removeItem('admin_table_view');
      showToast('Admin preferences have been reset to defaults.', 'success');
    } catch {
      showToast('Preferences reset.', 'info');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      <SEO title="Admin Console | Harshit Rai" noindex={true} />
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white capitalize">
              {activeTab === 'dashboard' ? 'Portfolio Overview' : `${activeTab} Management`}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {activeTab === 'dashboard'
                ? 'High-level inventory of verified portfolio resources and incoming data'
                : `Dedicated administrative console for ${activeTab}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetDashboardView}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA] hover:bg-neutral-50 dark:hover:bg-white/[0.04] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              title="Reset dashboard view to default"
            >
              <RotateCcw size={13} />
              <span>Reset View</span>
            </button>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#D7E2EA] hover:bg-neutral-50 dark:hover:bg-white/[0.04] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              title="Refresh inventory counts"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <span>View Site</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Dashboard Main View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Primary Counts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
              {/* Analytics Card */}
              <div
                onClick={() => setActiveTab('analytics')}
                className="p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Page Views
                  </span>
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
                    <BarChart3 size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                    {loading ? '...' : counts.pageViews.toLocaleString()}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">{counts.uniqueSessions}</span> tab sessions
                  </p>
                </div>
              </div>

              {/* Projects Card */}
              <div
                onClick={() => setActiveTab('projects')}
                className="p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Projects
                  </span>
                  <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/40 group-hover:scale-105 transition-transform">
                    <FolderGit2 size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                    {loading ? '...' : counts.projects}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{counts.featuredProjects}</span> featured builds
                  </p>
                </div>
              </div>

              {/* Skills Card */}
              <div
                onClick={() => setActiveTab('skills')}
                className="p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Skills
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 group-hover:scale-105 transition-transform">
                    <Code size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                    {loading ? '...' : counts.skills}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Across <span className="font-semibold text-emerald-600 dark:text-emerald-400">{counts.skillCategories}</span> categories
                  </p>
                </div>
              </div>

              {/* Messages Card */}
              <div
                onClick={() => setActiveTab('messages')}
                className="p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Messages
                  </span>
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 group-hover:scale-105 transition-transform">
                    <Mail size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                    {loading ? '...' : counts.messages}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Inquiries received
                  </p>
                </div>
              </div>

              {/* Feedback Card */}
              <div
                onClick={() => setActiveTab('feedback')}
                className="p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Feedback
                  </span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 group-hover:scale-105 transition-transform">
                    <MessageSquareQuote size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                    {loading ? '...' : counts.feedback}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Testimonials registered
                  </p>
                </div>
              </div>
            </div>

            {/* Trajectory Highlights & Quick Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Projects Summary */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Cataloged Projects ({counts.projects})
                  </h3>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                  >
                    <span>View all</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-white/05">
                  {recentProjects.map((proj) => (
                    <div key={proj.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {proj.title}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {proj.badge || 'Engineering'} • {(proj.technologies || []).slice(0, 3).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {proj.featured && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-medium border border-primary-200/60 dark:border-primary-900/40">
                            Featured
                          </span>
                        )}
                        <Link
                          to={`/projects/${proj.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/[0.05]"
                          title="Preview public project page"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills & Academic Inventory */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Skills & Content Inventory
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  {skillCategoriesList.map((catGroup) => (
                    <div key={catGroup.category} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/05">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {catGroup.category}
                      </span>
                      <span className="font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#141516] border border-neutral-200 dark:border-white/10 font-semibold text-primary-600 dark:text-primary-400">
                        {(catGroup.skills || []).length} skills
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-neutral-100 dark:border-white/05 flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Education: {counts.education} degree program</span>
                    <span>Milestones: {counts.experience + counts.hackathons + counts.research + counts.achievements + counts.certifications} entries</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Analytics Inbound Banner */}
            <div className="p-5 rounded-xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-900/40">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Privacy-Conscious Visitor Telemetry Active
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Tracking anonymous page views, project popularity, and referral channels with zero PII.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('analytics')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#141516] hover:bg-neutral-50 dark:hover:bg-white/[0.04] border border-neutral-200 dark:border-white/10 text-xs font-semibold text-neutral-800 dark:text-[#D7E2EA] shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <span>Open Analytics Console</span>
                <ArrowRight size={14} className="text-primary-600 dark:text-primary-400" />
              </button>
            </div>
          </div>
        )}

        {/* Isolated Tab Views with Fault-Tolerant Error Boundary */}
        <AdminErrorBoundary key={activeTab} onResetTab={() => setActiveTab('dashboard')}>
          {/* Projects Management CRUD View */}
          {activeTab === 'projects' && (
            <ProjectManager onProjectChanged={fetchDashboardData} />
          )}

          {/* Skills Management CRUD View */}
          {activeTab === 'skills' && (
            <SkillManager onSkillChanged={fetchDashboardData} />
          )}

          {/* Education Management CRUD View */}
          {activeTab === 'education' && (
            <EducationManager onEducationChanged={fetchDashboardData} />
          )}

          {/* Milestones Management CRUD View (Experience, Hackathons, Research, Achievements, Certifications) */}
          {(activeTab === 'experience' ||
            activeTab === 'hackathons' ||
            activeTab === 'research' ||
            activeTab === 'achievements' ||
            activeTab === 'certifications') && (
            <TimelineManager
              initialType={activeTab}
              onTimelineChanged={fetchDashboardData}
            />
          )}

          {/* Messages Inbox View */}
          {activeTab === 'messages' && (
            <MessageManager onMessageChanged={fetchDashboardData} />
          )}

          {/* Feedback Moderation View */}
          {activeTab === 'feedback' && (
            <FeedbackManager onFeedbackChanged={fetchDashboardData} />
          )}

          {/* Analytics Console View */}
          {activeTab === 'analytics' && (
            <AnalyticsManager onDataChanged={fetchDashboardData} />
          )}
        </AdminErrorBoundary>

        {/* Settings View */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Admin Preferences */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/40">
                    <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Console Preferences
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Configure your local admin interface preferences
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/05">
                    <div>
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Theme Mode
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Currently: <span className="font-mono capitalize font-medium">{theme}</span> mode
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141516] border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      Toggle Theme
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/05">
                    <div>
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        Reset Admin Preferences
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Restores default UI filters and local caches without modifying database
                      </div>
                    </div>
                    <button
                      onClick={handleResetAdminPreferences}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200/80 dark:bg-white/[0.06] hover:bg-neutral-300 dark:hover:bg-white/[0.10] text-neutral-800 dark:text-neutral-200 border border-neutral-300/60 dark:border-white/10 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Environment & Production Health */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Deployment & Environment
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Verified infrastructure parameters and live configuration
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/05">
                    <span className="text-neutral-500">Production URL:</span>
                    <a
                      href={SITE_CONFIG.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>{SITE_CONFIG.url}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/05">
                    <span className="text-neutral-500">Firebase Backend:</span>
                    <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={13} />
                      <span>Online / Active</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/05">
                    <span className="text-neutral-500">Active Admin Session:</span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[200px]">
                      {currentUser?.email || 'admin@portfolio'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/05">
                    <span className="text-neutral-500">Deployment Target:</span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">
                      Vercel Production
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset & Quick Actions Bar */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#101112] border border-neutral-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-900/40">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                    Need to inspect or reset traffic metrics?
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Visitor analytics buffer and telemetry events are maintained under the Analytics console.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('analytics')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <span>Go to Analytics</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
