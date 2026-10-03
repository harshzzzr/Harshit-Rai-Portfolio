import React, { useState, useEffect } from 'react';
import {
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  MessageSquareQuote,
  Clock
} from 'lucide-react';
import { submitFeedback, getApprovedFeedback } from '../services/feedbackService';

const RATING_LABELS = {
  1: '1: Needs Improvement',
  2: '2: Fair',
  3: '3: Good',
  4: '4: Very Good',
  5: '5: Exceptional'
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
    <section id="feedback" className="py-20 relative border-t border-neutral-200 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-neutral-100 dark:bg-white/[0.05] text-neutral-700 dark:text-[#D7E2EA] border border-neutral-200 dark:border-white/10 mb-3 shadow-xs">
            <MessageSquareQuote size={13} />
            <span>Peer & Professional Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-[#D7E2EA]">
            Feedback & Endorsements
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-[#D7E2EA]/70">
            Share your feedback on our collaboration, projects, or technical discussions. All submissions undergo moderation before appearing publicly.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Approved Testimonials / Reviews (lg: 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareQuote size={18} className="text-neutral-700 dark:text-[#D7E2EA]" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-[#D7E2EA]">
                  Approved Endorsements
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-500 dark:text-[#D7E2EA]/60 bg-neutral-100 dark:bg-[#141516] border border-neutral-200 dark:border-white/10 px-2.5 py-1 rounded-md">
                {approvedList.length} {approvedList.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            {loadingApproved ? (
              <div className="p-8 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] flex flex-col items-center justify-center space-y-3">
                <Loader2 size={24} className="animate-spin text-neutral-400" />
                <p className="text-xs text-neutral-500 dark:text-[#D7E2EA]/60 font-mono">Loading reviews...</p>
              </div>
            ) : approvedList.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-neutral-300 dark:border-white/10 bg-white/60 dark:bg-[#101112]/60 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-lg bg-neutral-100 dark:bg-[#141516] flex items-center justify-center text-neutral-400">
                  <MessageSquareQuote size={24} />
                </div>
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-[#D7E2EA]">
                  No Public Reviews Yet
                </h4>
                <p className="text-xs text-neutral-500 dark:text-[#D7E2EA]/60 max-w-sm mx-auto">
                  Be the first to share an endorsement or feedback. Submitted entries are published here upon administrator approval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-6 rounded-xl border transition-all ${
                      item.featured
                        ? 'border-amber-400/40 dark:border-amber-400/30 glass-subtle shadow-sm ring-1 ring-amber-400/15'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] shadow-sm'
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
                                  : 'text-neutral-200 dark:text-neutral-800'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-neutral-600 dark:text-[#D7E2EA]/70">
                          {item.rating}.0
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.featured && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/25 shadow-xs">
                            <span>Featured</span>
                          </span>
                        )}

                        {item.createdAt && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 dark:text-[#D7E2EA]/50">
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
                      <span className="text-3xl font-serif text-neutral-300 dark:text-white/20 leading-none select-none absolute -top-2 -left-1 opacity-60">
                        “
                      </span>
                      <p className="text-neutral-700 dark:text-[#D7E2EA]/85 text-sm leading-relaxed pl-4 italic break-words">
                        {item.feedback}
                      </p>
                    </div>

                    {/* Author Signature */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-neutral-100 dark:border-white/10 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-neutral-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {(item.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-neutral-900 dark:text-[#D7E2EA] break-words">
                          {item.name}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded shrink-0">
                        <ShieldCheck size={11} />
                        <span>Moderated Review</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Feedback Submission Form (lg: 5 cols - Solid Architectural Surface) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#101112] p-4 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-[#D7E2EA]">
                  Leave a Review
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#D7E2EA]/60 mt-1">
                  Your feedback helps improve future engineering projects and collaborations.
                </p>
              </div>

              {/* Success Notification State */}
              {submitted ? (
                <div role="status" aria-live="polite" className="py-6 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={30} aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-900 dark:text-[#D7E2EA]">
                      Thank You for Your Feedback!
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#D7E2EA]/70 mt-1 max-w-sm mx-auto">
                      Your submission has been recorded with status <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">pending</span> and will appear publicly once approved by the administrator.
                    </p>
                  </div>
                  <button
                    onClick={handleResetForm}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-[#141516] hover:bg-neutral-200 dark:hover:bg-[#1a1c1e] border border-neutral-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-neutral-400"
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
                    <div role="alert" className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="feedback_name"
                      className="block text-xs font-medium text-neutral-700 dark:text-[#D7E2EA]/80 mb-1.5"
                    >
                      Your Name / Role <span className="text-rose-500">*</span>
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
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-neutral-50 dark:bg-[#141516] border ${
                        errors.name
                          ? 'border-rose-500 focus:ring-rose-500'
                          : 'border-neutral-200 dark:border-white/10 focus:ring-neutral-400 dark:focus:ring-white/20'
                      } text-neutral-900 dark:text-[#D7E2EA] placeholder-neutral-400 dark:placeholder-neutral-500 focus-visible:ring-2 transition-all`}
                    />
                    {errors.name && (
                      <p id="feedback-name-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Star Rating Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label id="rating-label" className="block text-xs font-medium text-neutral-700 dark:text-[#D7E2EA]/80">
                        Rating <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] font-mono text-neutral-700 dark:text-[#D7E2EA]/90 font-medium">
                        {RATING_LABELS[activeRating] || `${activeRating} Stars`}
                      </span>
                    </div>

                    <div
                      role="radiogroup"
                      aria-labelledby="rating-label"
                      className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-[#141516] border border-neutral-200 dark:border-white/10"
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
                          className="p-1 rounded transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-neutral-400"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}: ${RATING_LABELS[star]}`}
                        >
                          <Star
                            size={20}
                            className={`sm:w-6 sm:h-6 transition-colors ${
                              star <= activeRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-neutral-300 dark:text-neutral-700'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                    {errors.rating && (
                      <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
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
                        className="block text-xs font-medium text-neutral-700 dark:text-[#D7E2EA]/80"
                      >
                        Feedback / Review <span className="text-rose-500">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-mono ${
                          formData.feedback.length > 950
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-neutral-500 dark:text-[#D7E2EA]/50'
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
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm bg-neutral-50 dark:bg-[#141516] border ${
                        errors.feedback
                          ? 'border-rose-500 focus:ring-rose-500'
                          : 'border-neutral-200 dark:border-white/10 focus:ring-neutral-400 dark:focus:ring-white/20'
                      } text-neutral-900 dark:text-[#D7E2EA] placeholder-neutral-400 dark:placeholder-neutral-500 focus-visible:ring-2 transition-all resize-none`}
                    />
                    {errors.feedback && (
                      <p id="feedback-text-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{errors.feedback}</span>
                      </p>
                    )}
                  </div>

                  {/* Moderation Safety Notice */}
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-[11px] text-neutral-600 dark:text-[#D7E2EA]/70 flex items-start gap-2">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-neutral-700 dark:text-[#D7E2EA]" />
                    <span>
                      Submissions are held as <strong className="text-neutral-800 dark:text-[#D7E2EA] font-medium">pending</strong> for moderation and only appear publicly upon administrator review.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-[#D7E2EA] dark:hover:bg-white text-white dark:text-neutral-900 font-semibold text-sm transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
