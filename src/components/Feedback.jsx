import React, { useState, useEffect } from 'react';
import {
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  MessageSquareQuote,
  Clock,
  Sparkles
} from 'lucide-react';
import { submitFeedback, getApprovedFeedback } from '../services/feedbackService';

const RATING_LABELS = {
  1: '1 — Needs Improvement',
  2: '2 — Fair',
  3: '3 — Good',
  4: '4 — Very Good',
  5: '5 — Exceptional'
};

export default function Feedback() {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    feedback: '',
    fax_number: '' // Anti-bot honeypot
  });

  const [hoveredStar, setHoveredStar] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Approved Feedback List State
  const [approvedList, setApprovedList] = useState([]);
  const [loadingApproved, setLoadingApproved] = useState(true);

  // Load approved feedback on mount
  useEffect(() => {
    loadApprovedReviews();
  }, []);

  const loadApprovedReviews = async () => {
    setLoadingApproved(true);
    try {
      const res = await getApprovedFeedback();
      if (res.success && Array.isArray(res.data)) {
        setApprovedList(res.data);
      }
    } catch (err) {
      console.warn('[Feedback] Failed to fetch approved reviews:', err);
    } finally {
      setLoadingApproved(false);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    const cleanName = formData.name.trim();
    const cleanFeedback = formData.feedback.trim();

    if (!cleanName) {
      newErrors.name = 'Full name or organization is required.';
    } else if (cleanName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    } else if (cleanName.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5 stars.';
    }

    if (!cleanFeedback) {
      newErrors.feedback = 'Feedback text is required.';
    } else if (cleanFeedback.length < 5) {
      newErrors.feedback = 'Feedback must be at least 5 characters.';
    } else if (cleanFeedback.length > 1000) {
      newErrors.feedback = 'Feedback cannot exceed 1000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleRatingSelect = (starValue) => {
    setFormData((prev) => ({ ...prev, rating: starValue }));
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await submitFeedback({
        name: formData.name,
        rating: formData.rating,
        feedback: formData.feedback,
        honeypot: formData.fax_number
      });

      if (res.success) {
        setSubmitted(true);
        // Form reset after successful submission
        setFormData({
          name: '',
          rating: 5,
          feedback: '',
          fax_number: ''
        });
        setErrors({});
      } else {
        if (res.errors) {
          setErrors(res.errors);
        }
        setSubmitError(res.message || 'Submission failed. Please check the fields and try again.');
      }
    } catch (err) {
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      rating: 5,
      feedback: '',
      fax_number: ''
    });
    setErrors({});
    setSubmitError('');
  };

  const activeRating = hoveredStar || formData.rating;

  return (
    <section id="feedback" className="py-20 bg-slate-50/70 dark:bg-slate-900/40 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/60 mb-3">
            <MessageSquareQuote size={13} />
            <span>Community & Peer Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Feedback & Endorsements
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Share your feedback on our collaboration, projects, or technical discussions. All submissions undergo moderation before appearing publicly.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Approved Testimonials / Reviews (lg: 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Approved Endorsements
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {approvedList.length} {approvedList.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            {loadingApproved ? (
              <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col items-center justify-center space-y-3">
                <Loader2 size={24} className="animate-spin text-primary-600 dark:text-primary-400" />
                <p className="text-xs text-slate-500 font-mono">Loading reviews...</p>
              </div>
            ) : approvedList.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <MessageSquareQuote size={24} />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No Public Reviews Yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Be the first to share an endorsement or feedback! Submitted entries are published here upon administrator approval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                      item.featured
                        ? 'border-amber-300 dark:border-amber-500/60 bg-gradient-to-br from-amber-500/[0.04] via-white to-transparent dark:from-amber-500/[0.08] dark:via-slate-950 dark:to-transparent shadow-md shadow-amber-500/5 ring-1 ring-amber-400/20'
                        : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Top Row: Stars, Featured Pill, and Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5" aria-label={`${item.rating} out of 5 stars`}>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={15}
                              className={`${
                                s <= item.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200 dark:text-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400">
                          {item.rating}.0
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.featured && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 shadow-xs">
                            <Sparkles size={11} className="text-amber-500 fill-amber-500" />
                            <span>Featured</span>
                          </span>
                        )}

                        {item.createdAt && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            <Clock size={11} />
                            <span>
                              {new Date(item.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback Quote Body */}
                    <div className="relative my-3">
                      <span className="text-3xl font-serif text-primary-300 dark:text-primary-800 leading-none select-none absolute -top-2 -left-1 opacity-60">
                        “
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed pl-4 italic">
                        {item.feedback}
                      </p>
                    </div>

                    {/* Author Signature */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-600 to-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {(item.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        <ShieldCheck size={11} />
                        <span>Verified Review</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Feedback Submission Form (lg: 5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Leave a Review
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Your feedback helps improve future engineering projects and collaborations.
                </p>
              </div>

              {/* Success Notification State */}
              {submitted ? (
                <div role="status" aria-live="polite" className="py-6 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={30} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Thank You for Your Feedback!
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Your submission has been recorded with status <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">pending</span> and will appear publicly once approved by the administrator.
                    </p>
                  </div>
                  <button
                    onClick={handleResetForm}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Submit Another Review
                  </button>
                </div>
              ) : (
                /* Submission Form */
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Honeypot field (hidden from legitimate users, caught by bots) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="feedback_fax_number">Fax Number</label>
                    <input
                      type="text"
                      id="feedback_fax_number"
                      name="fax_number"
                      value={formData.fax_number}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* General Error Banner */}
                  {submitError && (
                    <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="feedback_name"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Your Name / Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="feedback_name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={100}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'feedback-name-error' : undefined}
                      placeholder="e.g. Alex Rivera, Tech Lead"
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-300 dark:border-slate-800 focus:ring-primary-500'
                      } text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all`}
                    />
                    {errors.name && (
                      <p id="feedback-name-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Star Rating Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label id="rating-label" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Rating <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-primary-600 dark:text-primary-400 font-medium">
                        {RATING_LABELS[activeRating] || `${activeRating} Stars`}
                      </span>
                    </div>

                    <div
                      role="radiogroup"
                      aria-labelledby="rating-label"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          role="radio"
                          aria-checked={star === activeRating}
                          tabIndex={star === activeRating ? 0 : -1}
                          onClick={() => handleRatingSelect(star)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                              e.preventDefault();
                              const next = star < 5 ? star + 1 : 1;
                              handleRatingSelect(next);
                            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                              e.preventDefault();
                              const prev = star > 1 ? star - 1 : 5;
                              handleRatingSelect(prev);
                            }
                          }}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="p-1 rounded hover:scale-110 transition-transform cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''} — ${RATING_LABELS[star]}`}
                        >
                          <Star
                            size={24}
                            className={`transition-colors ${
                              star <= activeRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                    {errors.rating && (
                      <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.rating}</span>
                      </p>
                    )}
                  </div>

                  {/* Feedback Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="feedback_text"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Feedback / Review <span className="text-red-500">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-mono ${
                          formData.feedback.length > 950
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {formData.feedback.length} / 1000
                      </span>
                    </div>
                    <textarea
                      id="feedback_text"
                      name="feedback"
                      rows={4}
                      value={formData.feedback}
                      onChange={handleChange}
                      maxLength={1000}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(errors.feedback)}
                      aria-describedby={errors.feedback ? 'feedback-text-error' : undefined}
                      placeholder="Share your thoughts on collaboration, engineering quality, communication, or project milestones..."
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border ${
                        errors.feedback
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-300 dark:border-slate-800 focus:ring-primary-500'
                      } text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-primary-500 transition-all resize-none`}
                    />
                    {errors.feedback && (
                      <p id="feedback-text-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.feedback}</span>
                      </p>
                    )}
                  </div>

                  {/* Moderation Safety Notice */}
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary-600 dark:text-primary-400" />
                    <span>
                      Submissions are held as <strong className="text-slate-700 dark:text-slate-300 font-medium">pending</strong> for moderation and only appear publicly upon administrator review.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting Feedback...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
