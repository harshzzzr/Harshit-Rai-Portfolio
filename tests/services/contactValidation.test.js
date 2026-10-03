import { describe, it, expect, beforeEach } from 'vitest';
import { validateContactPayload } from '../../src/services/messageService';

describe('Contact Message Validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const validPayload = {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.org',
    subject: 'Project Inquiry',
    message: 'Hello Harshit, I would love to discuss a prospective engineering role.',
    honeypot: '',
  };

  it('passes for a fully valid payload', () => {
    const result = validateContactPayload(validPayload);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.name).toBe('Alice Johnson');
    expect(result.sanitized.email).toBe('alice.johnson@example.org');
    expect(result.sanitized.subject).toBe('Project Inquiry');
  });

  it('rejects submissions with bot honeypot populated', () => {
    const result = validateContactPayload({
      ...validPayload,
      honeypot: 'spam-bot-value',
    });

    expect(result.isValid).toBe(false);
    expect(result.isBot).toBe(true);
    expect(result.error).toMatch(/Spam submission detected/i);
  });

  it('validates name length constraints', () => {
    // Too short
    const shortResult = validateContactPayload({ ...validPayload, name: 'A' });
    expect(shortResult.isValid).toBe(false);
    expect(shortResult.errors.name).toMatch(/at least 2 characters/i);

    // Too long (> 100)
    const longName = 'A'.repeat(101);
    const longResult = validateContactPayload({ ...validPayload, name: longName });
    expect(longResult.isValid).toBe(false);
    expect(longResult.errors.name).toMatch(/cannot exceed 100 characters/i);
  });

  it('validates email format strictly', () => {
    // Missing domain
    const badEmail1 = validateContactPayload({ ...validPayload, email: 'notanemail' });
    expect(badEmail1.isValid).toBe(false);
    expect(badEmail1.errors.email).toMatch(/valid email address/i);

    // Missing TLD
    const badEmail2 = validateContactPayload({ ...validPayload, email: 'user@domain' });
    expect(badEmail2.isValid).toBe(false);
    expect(badEmail2.errors.email).toMatch(/valid email address/i);
  });

  it('validates subject length constraints', () => {
    // Less than 3 chars
    const shortSub = validateContactPayload({ ...validPayload, subject: 'Hi' });
    expect(shortSub.isValid).toBe(false);
    expect(shortSub.errors.subject).toMatch(/at least 3 characters/i);
  });

  it('validates message length constraints', () => {
    // Less than 10 chars
    const shortMsg = validateContactPayload({ ...validPayload, message: 'Too short' });
    expect(shortMsg.isValid).toBe(false);
    expect(shortMsg.errors.message).toMatch(/at least 10 characters/i);

    // More than 3000 chars
    const longMsg = 'a'.repeat(3001);
    const longMsgResult = validateContactPayload({ ...validPayload, message: longMsg });
    expect(longMsgResult.isValid).toBe(false);
    expect(longMsgResult.errors.message).toMatch(/cannot exceed 3,000 characters/i);
  });

  it('sanitizes script tags from input fields', () => {
    const maliciousPayload = {
      ...validPayload,
      name: 'Alice <script>alert("xss")</script>',
      message: 'Legitimate text with <script>hack()</script> embedded.',
    };

    const result = validateContactPayload(maliciousPayload);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.name).not.toContain('<script>');
    expect(result.sanitized.message).not.toContain('<script>');
  });
});
