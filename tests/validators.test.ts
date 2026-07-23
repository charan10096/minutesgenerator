import { describe, it, expect } from 'vitest';
import { validateLLMResult, assertValid } from '../validators';

const validResult = {
  title: 'Weekly Standup',
  participants: ['Alice', 'Bob'],
  agenda: ['Sprint review'],
  executive_summary: 'Discussed sprint progress.',
  detailed_summary: 'Detailed discussion about sprint.',
  bullet_summary: ['Point 1', 'Point 2'],
  timeline_summary: 'Started with review, ended with planning.',
  highlights: ['Highlight 1'],
  discussion_points: ['Topic 1'],
  decisions: [
    { decision: 'Ship feature X', decision_maker: 'Alice', reason: 'Ready', impact: 'High', confidence_score: 0.9 },
  ],
  risks: [
    { risk: 'Timeline risk', category: 'timeline', severity: 'medium', mitigation: 'Add resources', confidence_score: 0.8 },
  ],
  action_items: [
    { task: 'Fix bug', owner: 'Bob', department: 'Engineering', priority: 'high', deadline: '2025-01-15', estimated_effort: '2 hours', dependencies: 'None', confidence_score: 0.95 },
  ],
  confidence_score: 0.88,
  sentiment: 'positive',
  language: 'en',
};

describe('validateLLMResult', () => {
  it('accepts a valid result', () => {
    const { valid, errors } = validateLLMResult(validResult);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-object', () => {
    const { valid, errors } = validateLLMResult('not an object');
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects missing arrays', () => {
    const { valid, errors } = validateLLMResult({ title: 'Test', participants: 'not array' });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('participants'))).toBe(true);
  });

  it('rejects out-of-range confidence_score', () => {
    const { valid, errors } = validateLLMResult({ ...validResult, confidence_score: 1.5 });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('confidence_score'))).toBe(true);
  });

  it('rejects invalid sentiment', () => {
    const { valid, errors } = validateLLMResult({ ...validResult, sentiment: 'excited' });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('sentiment'))).toBe(true);
  });
});

describe('assertValid', () => {
  it('does not throw for valid data', () => {
    expect(() => assertValid(validResult)).not.toThrow();
  });

  it('throws for invalid data', () => {
    expect(() => assertValid({ title: 123 })).toThrow();
  });
});
