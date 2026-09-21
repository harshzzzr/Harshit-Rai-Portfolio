import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { getProjects } from '../services/projectService';
import { getSkills } from '../services/skillService';
import { getEducation, getTimelineData } from '../services/timelineService';
import { getMessageCount } from '../services/messageService';
import { getAllFeedback } from '../services/feedbackService';
import { db, isFirebaseConfigured } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { COLLECTIONS } from '../firebase/collections';
import {
  FolderGit2,
  Code,
  Mail,
  MessageSquareQuote,
  GraduationCap,
  Briefcase,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectManager from '../components/admin/ProjectManager';
import SkillManager from '../components/admin/SkillManager';
import EducationManager from '../components/admin/EducationManager';
import TimelineManager from '../components/admin/TimelineManager';
import MessageManager from '../components/admin/MessageManager';
import FeedbackManager from '../components/admin/FeedbackManager';

export default function AdminDashboardPage() {
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
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [skillCategoriesList, setSkillCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
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
      });

      setRecentProjects(projectList.slice(0, 4));
      setSkillCategoriesList(skillCats);
    } catch (err) {
      console.error('[Admin] Error loading counts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
              {activeTab === 'dashboard' ? 'Portfolio Overview' : `${activeTab} Management`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {activeTab === 'dashboard'
                ? 'High-level inventory of verified portfolio resources and incoming data'
                : `Dedicated administrative console for ${activeTab}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              title="Refresh inventory counts"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors shadow-xs"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Projects Card */}
              <div
                onClick={() => setActiveTab('projects')}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Projects
                  </span>
                  <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                    <FolderGit2 size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {loading ? '...' : counts.projects}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{counts.featuredProjects}</span> featured builds
                  </p>
                </div>
              </div>

              {/* Skills Card */}
              <div
                onClick={() => setActiveTab('skills')}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Skills
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Code size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {loading ? '...' : counts.skills}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Across <span className="font-semibold text-emerald-600 dark:text-emerald-400">{counts.skillCategories}</span> categories
                  </p>
                </div>
              </div>

              {/* Messages Card */}
              <div
                onClick={() => setActiveTab('messages')}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Messages
                  </span>
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                    <Mail size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {loading ? '...' : counts.messages}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Inquiries received
                  </p>
                </div>
              </div>

              {/* Feedback Card */}
              <div
                onClick={() => setActiveTab('feedback')}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Feedback
                  </span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <MessageSquareQuote size={20} />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {loading ? '...' : counts.feedback}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Testimonials registered
                  </p>
                </div>
              </div>
            </div>

            {/* Trajectory Highlights & Quick Inventory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Projects Summary */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
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

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentProjects.map((proj) => (
                    <div key={proj.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {proj.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {proj.badge || 'Engineering'} • {proj.technologies.slice(0, 3).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {proj.featured && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-medium">
                            Featured
                          </span>
                        )}
                        <Link
                          to={`/projects/${proj.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
              <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Skills & Content Inventory
                </h3>

                <div className="space-y-3 text-xs sm:text-sm">
                  {skillCategoriesList.map((catGroup) => (
                    <div key={catGroup.category} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {catGroup.category}
                      </span>
                      <span className="font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-primary-600 dark:text-primary-400">
                        {catGroup.skills.length} skills
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-between text-xs text-slate-500">
                    <span>Education: {counts.education} degree program</span>
                    <span>Milestones: {counts.experience + counts.hackathons + counts.research + counts.achievements + counts.certifications} entries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Dedicated Section Placeholders for remaining sidebar tabs (settings) */}
        {activeTab !== 'dashboard' &&
          activeTab !== 'projects' &&
          activeTab !== 'skills' &&
          activeTab !== 'education' &&
          activeTab !== 'experience' &&
          activeTab !== 'hackathons' &&
          activeTab !== 'research' &&
          activeTab !== 'achievements' &&
          activeTab !== 'certifications' &&
          activeTab !== 'messages' &&
          activeTab !== 'feedback' && (
          <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-sm animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 mx-auto flex items-center justify-center">
              <Sliders size={32} />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {activeTab} Management
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeTab === 'settings' && 'Administrator preferences and Firebase environment status settings.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Section verified in v4.1 navigation</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Return to Overview</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
