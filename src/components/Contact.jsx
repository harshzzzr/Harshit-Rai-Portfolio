import React, { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck, Lock } from 'lucide-react';
import { personalInfo } from '../data/portfolioData';
import { submitContactMessage, checkClientRateLimit } from '../services/messageService';

export default function Contact() {
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
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contact Me
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Have a project idea, question, or looking to collaborate? Drop a message below.
          </p>
          <div className="w-12 h-1 bg-primary-500 mx-auto rounded-full mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Let's Connect
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                I'm actively interested in software engineering internships, open-source projects, and collaborative technical challenges.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold block">
                    Direct Email
                  </span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {personalInfo.contact.email}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold block">
                    Availability
                  </span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {personalInfo.contact.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck size={14} />
                <span>Cloud Firestore Connected</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Messages are delivered securely to Firestore `messages` and protected from public access.
              </p>
            </div>
          </div>

          {/* Right Column: Visual Contact Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
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
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-1 cursor-pointer"
                  title="Dismiss alert"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {isSubmitted ? (
              <div className="text-center py-10 space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Message Delivered Successfully!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out! Your message has been safely saved to Cloud Firestore with an unread status. I'll get back to you as soon as possible.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setServerError(null);
                      setErrors({});
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm"
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
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      maxLength={100}
                      disabled={isSubmitting}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border ${
                        errors.name
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                      } text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
                    />
                    {errors.name && (
                      <p className="flex items-center gap-1 text-xs text-rose-500">
                        <AlertCircle size={12} />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Your Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      maxLength={150}
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border ${
                        errors.email
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                      } text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
                    />
                    {errors.email && (
                      <p className="flex items-center gap-1 text-xs text-rose-500">
                        <AlertCircle size={12} />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    maxLength={200}
                    disabled={isSubmitting}
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineering Opportunity"
                    className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border ${
                      errors.subject
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-60`}
                  />
                  {errors.subject && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <AlertCircle size={12} />
                      <span>{errors.subject}</span>
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono ${
                        formData.message.length > 2800 ? 'text-amber-500 font-bold' : 'text-slate-400 dark:text-slate-500'
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
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Hello Harshit, I'd like to discuss..."
                    className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border ${
                      errors.message
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500/20'
                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all resize-none disabled:opacity-60`}
                  />
                  {errors.message && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <AlertCircle size={12} />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Delivering Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
