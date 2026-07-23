import { describe, it, expect } from 'vitest';
import {
  extractActionItems,
  extractRisks,
  extractDecisions,
  extractDeadlines,
} from '../extractor';
import type { LLMMeetingResult } from '../lib/types';

const mockResult: LLMMeetingResult = {
  title: 'Test Meeting',
  participants: ['Alice'],
  agenda: ['Item 1'],
  executive_summary: 'Summary',
  detailed_summary: 'Detailed',
  bullet_summary: ['Bullet'],
  timeline_summary: 'Timeline',
  highlights: ['Highlight'],
  discussion_points: ['Point'],
  decisions: [
    { decision: 'Decide A', decision_maker: 'Alice', reason: 'Reason', impact: 'Impact', confidence_score: 0.9 },
  ],
  risks: [
    { risk: 'Risk 1', category: 'technical', severity: 'high', mitigation: 'Fix it', confidence_score: 0.8 },
  ],
  action_items: [
    { task: 'Task A', owner: 'Bob', department: 'Eng', priority: 'high', deadline: '2025-02-01', estimated_effort: '3h', dependencies: 'None', confidence_score: 0.9 },
    { task: 'Task A', owner: 'Bob', department: 'Eng', priority: 'high', deadline: '2025-02-01', estimated_effort: '3h', dependencies: 'None', confidence_score: 0.9 },
    { task: 'Task B', owner: 'Carol', department: 'Sales', priority: 'invalid', deadline: null, estimated_effort: '', dependencies: '', confidence_score: 0.5 },
  ],
  confidence_score: 0.85,
  sentiment: 'positive',
  language: 'en',
};

describe('extractActionItems', () => {
  it('deduplicates by task name', () => {
    const items = extractActionItems(mockResult);
    expect(items).toHaveLength(2);
    expect(items[0].task).toBe('Task A');
    expect(items[1].task).toBe('Task B');
  });

  it('coerces invalid priority to medium', () => {
    const items = extractActionItems(mockResult);
    expect(items[1].priority).toBe('medium');
  });

  it('handles empty action_items', () => {
    const items = extractActionItems({ ...mockResult, action_items: [] });
    expect(items).toHaveLength(0);
  });
});

describe('extractRisks', () => {
  it('extracts risks with correct fields', () => {
    const risks = extractRisks(mockResult);
    expect(risks).toHaveLength(1);
    expect(risks[0].severity).toBe('high');
    expect(risks[0].category).toBe('technical');
  });
});

describe('extractDecisions', () => {
  it('extracts decisions', () => {
    const decisions = extractDecisions(mockResult);
    expect(decisions).toHaveLength(1);
    expect(decisions[0].decision_maker).toBe('Alice');
  });
});

describe('extractDeadlines', () => {
  it('only includes action items with deadlines', () => {
    const items = extractActionItems(mockResult);
    const deadlines = extractDeadlines(items);
    expect(deadlines).toHaveLength(1);
    expect(deadlines[0].task).toBe('Task A');
    expect(deadlines[0].due_date).toBe('2025-02-01');
  });
});
