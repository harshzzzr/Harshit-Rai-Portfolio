import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck, Copy, Check } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';
import { submitContactMessage, checkClientRateLimit } from '../services/messageService';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '' // Anti-bot trap field
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const newErrors = {};

    // 1. Rate limiting check
    const rateCheck = checkClientRateLimit();
    if (rateCheck.isLimited) {
      newErrors.general = `Rate limit active: Please wait ${rateCheck.remainingSeconds} seconds before sending another message.`;
      return newErrors;
    }

    // 2. Name validation (2 - 100 characters)
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    // 3. Strict RFC email validation (5 - 150 characters)
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (trimmedEmail.length > 150) {
      newErrors.email = 'Email address cannot exceed 150 characters.';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please provide a valid email address (e.g. name@domain.com).';
    }

    // 4. Subject validation (3 - 200 characters)
    const trimmedSubject = formData.subject.trim();
    if (!trimmedSubject) {
      newErrors.subject = 'Subject is required.';
    } else if (trimmedSubject.length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters.';
    } else if (trimmedSubject.length > 200) {
      newErrors.subject = 'Subject cannot exceed 200 characters.';
    }

    // 5. Message validation (10 - 3000 characters)
    const trimmedMessage = formData.message.trim();
    if (!trimmedMessage) {
      newErrors.message = 'Message content is required.';
    } else if (trimmedMessage.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    } else if (trimmedMessage.length > 3000) {
      newErrors.message = 'Message cannot exceed 3,000 characters.';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field once user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleCopyEmail = async () => {
    const emailToCopy = personalInfo.contact.email;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailToCopy);
      } else if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = emailToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('execCommand failed');
      } else {
        throw new Error('Clipboard unavailable');
      }
      setCopiedEmail(true);
      showToast('Email copied to clipboard!', 'success');
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      showToast('Unable to copy email. Please copy it manually.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await submitContactMessage(formData);

      if (res.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
      } else {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        }
        setServerError(res.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setServerError(err.message || 'Network error while delivering your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative border-t border-neutral-200 dark:border-white/10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-[#D7E2EA]/60">
            Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#D7E2EA]">
            Contact Me
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-[#D7E2EA]/70 max-w-xl mx-auto">
            Have a project idea, question, or looking to collaborate? Drop a message below.
          </p>
          <div className="w-12 h-0.5 bg-neutral-300 dark:bg-white/20 mx-auto rounded-sm mt-3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Information (Solid Architectural Surface) */}
          <div className="lg:col-span-5 p-4 sm:p-8 rounded-2xl bg-white dark:bg-[#101112] border border-neutral-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
                Let's Connect
              </h3>
              <p className="text-sm text-neutral-600 dark:text-[#D7E2EA]/70 leading-relaxed">
                I'm actively interested in software engineering internships, open-source projects, and collaborative technical challenges.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#141516] border border-neutral-200 dark:border-white/10">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-neutral-200/60 dark:bg-white/[0.06] text-neutral-900 dark:text-[#D7E2EA] shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-[#D7E2EA]/50 font-semibold block">
                      Direct Email
                    </span>
                    <a
                      href={`mailto:${personalInfo.contact.email}`}
                      className="text-sm font-medium text-neutral-800 dark:text-[#D7E2EA] hover:text-neutral-950 dark:hover:text-white break-all transition-colors"
                    >
                      {personalInfo.contact.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={copiedEmail ? 'Email copied' : 'Copy email address'}
                  title={copiedEmail ? 'Email copied!' : 'Copy Email'}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-neutral-400 self-start sm:self-center ${
                    copiedEmail
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-[#101112] text-neutral-700 dark:text-[#D7E2EA] border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-[#1a1c1e]'
                  }`}
                >
                  {copiedEmail ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedEmail ? 'Email copied!' : 'Copy Email'}</span>
                </button>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-3 rounded-lg bg-neutral-200/60 dark:bg-white/[0.06] text-neutral-900 dark:text-[#D7E2EA] shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-[#D7E2EA]/50 font-semibold block">
                    Availability
                  </span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-[#D7E2EA] break-words">
                    {personalInfo.contact.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-xs font-mono text-neutral-500 dark:text-[#D7E2EA]/60 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck size={14} />
                <span>Cloud Firestore Connected</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-[#D7E2EA]/60">
                Messages are delivered securely to Firestore `messages` and protected from public access.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Contact Form (Glass Form Container Focal Surface) */}
          <div className="lg:col-span-7 p-4 sm:p-8 rounded-2xl glass-panel shadow-sm">
            {/* General or Server Error Alert */}
            {(serverError || errors.general) && (
              <div className="mb-5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start justify-between gap-3 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Unable to submit message</p>
                    <p className="text-xs opacity-90">{serverError || errors.general}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setServerError(null);
                    setErrors((prev) => ({ ...prev, general: '' }));
                  }}
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
                  aria-label="Dismiss alert"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            )}

            {isSubmitted ? (
              <div role="status" aria-live="polite" className="text-center py-10 space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={32} aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
                  Message Delivered Successfully!
                </h3>
                <p className="text-sm text-neutral-600 dark:text-[#D7E2EA]/70 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out! Your message has been safely saved to Cloud Firestore with an unread status. I'll get back to you as soon as possible.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setServerError(null);
                      setErrors({});
                    }}
                    className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-[#D7E2EA] dark:hover:bg-white text-white dark:text-neutral-900 text-sm font-semibold transition-colors cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-neutral-400"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Anti-Bot Honeypot field (hidden from human visitors) */}
                <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                  <label htmlFor="fax_number">Do not fill this field</label>
                  <input
                    type="text"
                    id="fax_number"
                    name="fax_number"
                    tabIndex="-1"
                    autoComplete="off"
                    value={formData.honeypot}
                    onChange={(e) => setFormData((prev) => ({ ...prev, honeypot: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-xs font-semibold text-neutral-700 dark:text-[#D7E2EA]/80">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      maxLength={100}
                      disabled={isSubmitting}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/60 dark:bg-white/[0.04] border ${
                        errors.name
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-neutral-200 dark:border-white/10 focus:border-neutral-400 dark:focus:border-white/30 focus:ring-neutral-400/20'
                      } text-neutral-900 dark:text-[#D7E2EA] focus-visible:ring-2 focus-visible:ring-neutral-400 transition-all disabled:opacity-60`}
                    />
                    {errors.name && (
                      <p id="contact-name-error" role="alert" className="flex items-center gap-1 text-xs text-rose-500">
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-semibold text-neutral-700 dark:text-[#D7E2EA]/80">
                      Your Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      maxLength={150}
                      disabled={isSubmitting}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/60 dark:bg-white/[0.04] border ${
                        errors.email
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-neutral-200 dark:border-white/10 focus:border-neutral-400 dark:focus:border-white/30 focus:ring-neutral-400/20'
                      } text-neutral-900 dark:text-[#D7E2EA] focus-visible:ring-2 focus-visible:ring-neutral-400 transition-all disabled:opacity-60`}
                    />
                    {errors.email && (
                      <p id="contact-email-error" role="alert" className="flex items-center gap-1 text-xs text-rose-500">
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="block text-xs font-semibold text-neutral-700 dark:text-[#D7E2EA]/80">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    maxLength={200}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineering Opportunity"
                    className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/60 dark:bg-white/[0.04] border ${
                      errors.subject
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-neutral-200 dark:border-white/10 focus:border-neutral-400 dark:focus:border-white/30 focus:ring-neutral-400/20'
                    } text-neutral-900 dark:text-[#D7E2EA] focus-visible:ring-2 focus-visible:ring-neutral-400 transition-all disabled:opacity-60`}
                  />
                  {errors.subject && (
                    <p id="contact-subject-error" role="alert" className="flex items-center gap-1 text-xs text-rose-500">
                      <AlertCircle size={12} aria-hidden="true" />
                      <span>{errors.subject}</span>
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="message" className="block text-xs font-semibold text-neutral-700 dark:text-[#D7E2EA]/80">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        formData.message.length > 2800 ? 'text-amber-500 font-bold' : 'text-neutral-500 dark:text-[#D7E2EA]/50'
                      }`}
                    >
                      {formData.message.length} / 3000
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    maxLength={3000}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Hello Harshit, I'd like to discuss..."
                    className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/60 dark:bg-white/[0.04] border ${
                      errors.message
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-neutral-200 dark:border-white/10 focus:border-neutral-400 dark:focus:border-white/30 focus:ring-neutral-400/20'
                    } text-neutral-900 dark:text-[#D7E2EA] focus-visible:ring-2 focus-visible:ring-neutral-400 transition-all resize-none disabled:opacity-60`}
                  />
                  {errors.message && (
                    <p id="contact-message-error" role="alert" className="flex items-center gap-1 text-xs text-rose-500">
                      <AlertCircle size={12} aria-hidden="true" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button & Legal Note */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-[#D7E2EA] dark:hover:bg-white text-white dark:text-neutral-900 text-sm font-semibold shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                        <span>Delivering Message...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} aria-hidden="true" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-500 dark:text-[#D7E2EA]/60">
                    Your contact information is protected in accordance with our{' '}
                    <a href="/privacy" className="text-neutral-800 dark:text-[#D7E2EA] hover:underline font-medium">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="/terms" className="text-neutral-800 dark:text-[#D7E2EA] hover:underline font-medium">
                      Terms
                    </a>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
