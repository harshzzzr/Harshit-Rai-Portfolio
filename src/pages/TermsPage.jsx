import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, ShieldAlert, CheckCircle, Mail } from 'lucide-react';
import SEO from '../components/SEO';
import { SITE_CONFIG } from '../config/site';

export default function TermsPage() {
  const lastUpdated = 'September 27, 2026';

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SEO
        title="Terms and Conditions | Harshit Rai"
        description="Terms of service and acceptable use conditions for Harshit Rai's developer portfolio."
        canonicalUrl={`${SITE_CONFIG.url}terms`}
        ogType="website"
      />

      {/* Back navigation */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-[#D7E2EA]/70 hover:text-neutral-950 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 rounded p-1"
        >
          <ArrowLeft size={14} />
          <span>Return to Portfolio</span>
        </Link>
      </div>

      <header className="space-y-3 pb-8 border-b border-neutral-200 dark:border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-neutral-100 dark:bg-white/[0.05] text-neutral-700 dark:text-[#D7E2EA] border border-neutral-200 dark:border-white/10 shadow-xs">
          <FileText size={14} />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#D7E2EA]">
          Terms & Conditions
        </h1>
        <p className="text-sm font-mono text-neutral-500 dark:text-[#D7E2EA]/60">
          Effective Date: {lastUpdated}
        </p>
      </header>

      <div className="py-8 space-y-8 text-sm sm:text-base text-neutral-700 dark:text-[#D7E2EA]/80 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA] flex items-center gap-2">
            <Scale size={18} className="text-neutral-700 dark:text-[#D7E2EA]" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing or browsing this website (harshit-rai-portfolio.vercel.app), you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions and the accompanying Privacy Policy. If you do not agree with any portion of these terms, please discontinue use of this website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA] flex items-center gap-2">
            <CheckCircle size={18} className="text-neutral-700 dark:text-[#D7E2EA]" />
            <span>2. Intellectual Property and Open-Source Licensing</span>
          </h2>
          <p>
            All custom graphics, website styling, documentation text, and structural layout on this site are the intellectual property of Harshit Rai unless otherwise credited.
          </p>
          <p>
            Open-source software projects showcased on this portfolio and hosted on GitHub are governed by their respective repository licenses (e.g. MIT, Apache 2.0, or BSD). You are encouraged to review the license file within each individual repository before reproducing or utilizing project source code.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA] flex items-center gap-2">
            <ShieldAlert size={18} className="text-neutral-700 dark:text-[#D7E2EA]" />
            <span>3. Acceptable Use of Forms and Services</span>
          </h2>
          <p>
            This website provides interactive communication modules including a direct contact form and a community feedback submission tool. By using these features, you agree:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>To submit only genuine inquiries, professional opportunities, or authentic peer reviews.</li>
            <li>Not to transmit automated spam, phishing attempts, fraudulent content, or deceptive marketing materials.</li>
            <li>Not to inject malicious code, scripts, SQL/NoSQL payloads, or exploit system endpoints.</li>
            <li>Not to impersonate any individual or entity in submitted messages or feedback.</li>
          </ul>
          <p>
            Submissions that violate these standards will be permanently discarded and may result in IP-level restrictions or reporting.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
            4. Accuracy of Information
          </h2>
          <p>
            The project details, academic coursework, technical skills, and milestones presented on this site are represented honestly and maintained to reflect verified engineering competence. However, software architectures, live demo links, and third-party dependencies are subject to periodic updates or changes without prior notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
            5. External Links
          </h2>
          <p>
            This site contains links to third-party web properties, including GitHub, LinkedIn, LeetCode, and Spotify. Harshit Rai has no control over the privacy practices, content, or availability of third-party platforms. Accessing external links is undertaken at your own discretion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
            6. Limitation of Liability
          </h2>
          <p>
            This website and its demonstrative code samples are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. Under no circumstances shall Harshit Rai be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this site or its code samples.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
            7. Contact Inquiries
          </h2>
          <p>
            For questions or inquiries regarding these Terms & Conditions, please contact:
          </p>
          <div className="p-4 rounded-xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 flex items-center gap-3">
            <Mail size={18} className="text-neutral-700 dark:text-[#D7E2EA] shrink-0" />
            <a
              href="mailto:harshittrrai@gmail.com"
              className="font-mono text-sm text-neutral-900 dark:text-[#D7E2EA] hover:underline"
            >
              harshittrrai@gmail.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
