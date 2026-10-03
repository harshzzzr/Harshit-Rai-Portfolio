import { describe, it, expect } from 'vitest';
import { validateFeedbackPayload } from '../../src/services/feedbackService';

describe('Feedback Payload Validation', () => {
  const validFeedback = {
    name: 'Robert Chen',
    rating: 5,
    feedback: 'Excellent developer portfolio with clean architecture and responsive UI!',
    honeypot: '',
  };

  it('validates a valid feedback submission', () => {
    const result = validateFeedbackPayload(validFeedback);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.rating).toBe(5);
    expect(result.sanitized.name).toBe('Robert Chen');
    expect(result.sanitized.feedback).toContain('Excellent developer portfolio');
  });

  it('detects and rejects bot honeypot input', () => {
    const result = validateFeedbackPayload({
      ...validFeedback,
      honeypot: 'spam_detected',
    });

    expect(result.isValid).toBe(false);
    expect(result.isBot).toBe(true);
  });

  it('accepts ratings strictly between 1 and 5 inclusive', () => {
    // Valid ratings
    for (let rating = 1; rating <= 5; rating++) {
      const res = validateFeedbackPayload({ ...validFeedback, rating });
      expect(res.isValid).toBe(true);
      expect(res.sanitized.rating).toBe(rating);
    }

    // String numbers parsed correctly
    const stringRatingRes = validateFeedbackPayload({ ...validFeedback, rating: '4' });
    expect(stringRatingRes.isValid).toBe(true);
    expect(stringRatingRes.sanitized.rating).toBe(4);

    // Invalid rating: 0
    const zeroRes = validateFeedbackPayload({ ...validFeedback, rating: 0 });
    expect(zeroRes.isValid).toBe(false);
    expect(zeroRes.errors.rating).toMatch(/between 1 and 5/i);

    // Invalid rating: 6
    const sixRes = validateFeedbackPayload({ ...validFeedback, rating: 6 });
    expect(sixRes.isValid).toBe(false);
    expect(sixRes.errors.rating).toMatch(/between 1 and 5/i);

    // Invalid rating: NaN/text
    const textRes = validateFeedbackPayload({ ...validFeedback, rating: 'excellent' });
    expect(textRes.isValid).toBe(false);
    expect(textRes.errors.rating).toMatch(/between 1 and 5/i);
  });

  it('validates name length boundaries', () => {
    // Too short
    const shortName = validateFeedbackPayload({ ...validFeedback, name: 'J' });
    expect(shortName.isValid).toBe(false);
    expect(shortName.errors.name).toMatch(/at least 2 characters/i);

    // Too long (> 100)
    const longName = validateFeedbackPayload({ ...validFeedback, name: 'X'.repeat(101) });
    expect(longName.isValid).toBe(false);
    expect(longName.errors.name).toMatch(/cannot exceed 100 characters/i);
  });

  it('validates feedback message length boundaries', () => {
    // Too short (< 5)
    const shortMsg = validateFeedbackPayload({ ...validFeedback, feedback: 'Good' });
    expect(shortMsg.isValid).toBe(false);
    expect(shortMsg.errors.feedback).toMatch(/at least 5 characters/i);

    // Too long (> 1000)
    const longMsg = validateFeedbackPayload({ ...validFeedback, feedback: 'Y'.repeat(1001) });
    expect(longMsg.isValid).toBe(false);
    expect(longMsg.errors.feedback).toMatch(/cannot exceed 1000 characters/i);
  });

  it('strips null bytes and control characters during sanitization', () => {
    const sanitizedResult = validateFeedbackPayload({
      ...validFeedback,
      name: 'Robert\0 Chen\u0007',
      feedback: 'Great work\0 on this project\u001F!',
    });

    expect(sanitizedResult.isValid).toBe(true);
    expect(sanitizedResult.sanitized.name).toBe('Robert Chen');
    expect(sanitizedResult.sanitized.feedback).toBe('Great work on this project!');
  });
});
