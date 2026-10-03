import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, Lock, Eye, Database } from 'lucide-react';
import SEO from '../components/SEO';
import { SITE_CONFIG } from '../config/site';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 27, 2026';

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEO
        title="Privacy Policy | Harshit Rai"
        description="Privacy policy and data protection transparency for Harshit Rai's developer portfolio."
        canonicalUrl={`${SITE_CONFIG.url}privacy`}
        ogType="website"
      />

      {/* Back navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-1"
        >
          <ArrowLeft size={14} />
          <span>Return to Portfolio</span>
        </Link>
      </div>

      <header className="space-y-3 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60">
          <ShieldCheck size={14} />
          <span>Legal & Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
          Effective Date: {lastUpdated}
        </p>
      </header>

      <div className="py-8 space-y-8 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock size={18} className="text-primary-600 dark:text-primary-400" />
            <span>1. Commitment to Privacy</span>
          </h2>
          <p>
            This portfolio website (accessible at harshit-rai-portfolio.vercel.app) is operated by Harshit Rai as a personal software engineering portfolio. Respecting user privacy and maintaining data transparency are foundational principles. This website does not sell, rent, or monetize personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database size={18} className="text-primary-600 dark:text-primary-400" />
            <span>2. Information We Collect</span>
          </h2>
          <div className="space-y-3 pl-2">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">A. Contact Form Inquiries</h3>
              <p className="mt-1">
                When you initiate communication through the direct contact form, you provide your name, email address, subject, and message body. This information is stored securely in Cloud Firestore solely to review inquiries and respond to relevant technical or professional opportunities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">B. Feedback and Peer Endorsements</h3>
              <p className="mt-1">
                If you submit a peer endorsement or review through the feedback module, your name, rating (1 to 5 stars), and review comments are transmitted for review. Submissions remain private in a pending queue until explicitly reviewed by the administrator.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">C. Anonymous Telemetry</h3>
              <p className="mt-1">
                To evaluate page performance and monitor project interest, the application logs anonymous visit telemetry (such as requested route path, approximate device category, HTTP referrer domain, and a random temporary session hash). We do not collect names, precise physical locations, or personal identity numbers via telemetry.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye size={18} className="text-primary-600 dark:text-primary-400" />
            <span>3. Cookies and Local Storage</span>
          </h2>
          <p>
            This website does not deploy third-party advertising cookies, cross-site trackers, or marketing pixels. The browser's local storage is utilized strictly for essential client preferences:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Theme Preference:</strong> Storing dark or light mode preference (`harshit_portfolio_theme`).</li>
            <li><strong>Submission Safeguards:</strong> Timestamp records to prevent accidental duplicate message submissions.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            4. Third-Party Integrations
          </h2>
          <p>
            The portfolio interfaces with public technical APIs to display developer activity:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>GitHub REST API:</strong> Used to display public open-source repositories and contribution statistics.</li>
            <li><strong>LeetCode API:</strong> Used to display algorithmic problem-solving milestones.</li>
            <li><strong>Spotify API:</strong> Used via decoupled architecture to present focus soundtracks without client authentication keys.</li>
            <li><strong>Google Firebase:</strong> Hosting and Cloud Firestore database infrastructure complying with Google Cloud security and privacy standards.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            5. Data Retention and Security
          </h2>
          <p>
            All submitted messages and feedback are guarded by server-side Firestore security rules that restrict modification and administrative read access exclusively to authenticated administrator credentials. Data is retained only as long as necessary to address inquiries.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            6. Your Rights and Data Deletion
          </h2>
          <p>
            You have the right to request a copy of any personal data you have submitted or request complete deletion of your submitted messages or testimonials at any time.
          </p>
          <p>
            To exercise these rights, email:
          </p>
          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Mail size={18} className="text-primary-600 dark:text-primary-400 shrink-0" />
            <a
              href="mailto:harshittrrai@gmail.com"
              className="font-mono text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              harshittrrai@gmail.com
            </a>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            7. Changes to this Policy
          </h2>
          <p>
            Any future revisions to this policy will be posted on this page with an updated effective date. Continued use of the website following revisions constitutes acknowledgment of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
