/**
 * Extractor — pulls structured entities (action items, risks,
 * decisions, deadlines) from the LLM response and deduplicates them.
 */

import type { LLMMeetingResult } from '@/lib/types';

export interface ExtractedActionItem {
  task: string;
  owner: string | null;
  department: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null;
  estimated_effort: string | null;
  dependencies: string | null;
  confidence_score: number | null;
}

export interface ExtractedRisk {
  risk: string;
  category: 'project' | 'technical' | 'budget' | 'timeline' | 'communication';
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string | null;
  confidence_score: number | null;
}

export interface ExtractedDecision {
  decision: string;
  decision_maker: string | null;
  reason: string | null;
  impact: string | null;
  confidence_score: number | null;
}

export interface ExtractedDeadline {
  task: string;
  owner: string | null;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
const VALID_CATEGORIES = ['project', 'technical', 'budget', 'timeline', 'communication'] as const;

type Priority = typeof VALID_PRIORITIES[number];
type Severity = typeof VALID_SEVERITIES[number];
type Category = typeof VALID_CATEGORIES[number];

function coercePriority(value: any): Priority {
  return VALID_PRIORITIES.includes(value) ? value : 'medium';
}

function coerceSeverity(value: any): Severity {
  return VALID_SEVERITIES.includes(value) ? value : 'medium';
}

function coerceCategory(value: any): Category {
  return VALID_CATEGORIES.includes(value) ? value : 'project';
}

export function extractActionItems(result: LLMMeetingResult): ExtractedActionItem[] {
  const seen = new Set<string>();
  return (result.action_items || []).filter((a) => {
    const key = (a.task || '').toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((a) => ({
    task: a.task || 'Untitled task',
    owner: a.owner || null,
    department: a.department || null,
    priority: coercePriority(a.priority),
    deadline: a.deadline || null,
    estimated_effort: a.estimated_effort || null,
    dependencies: a.dependencies || null,
    confidence_score: a.confidence_score ?? null,
  }));
}

export function extractRisks(result: LLMMeetingResult): ExtractedRisk[] {
  return (result.risks || []).map((r) => ({
    risk: r.risk || 'Untitled risk',
    category: coerceCategory(r.category),
    severity: coerceSeverity(r.severity),
    mitigation: r.mitigation || null,
    confidence_score: r.confidence_score ?? null,
  }));
}

export function extractDecisions(result: LLMMeetingResult): ExtractedDecision[] {
  return (result.decisions || []).map((d) => ({
    decision: d.decision || 'Untitled decision',
    decision_maker: d.decision_maker || null,
    reason: d.reason || null,
    impact: d.impact || null,
    confidence_score: d.confidence_score ?? null,
  }));
}

export function extractDeadlines(actionItems: ExtractedActionItem[]): ExtractedDeadline[] {
  return actionItems
    .filter((a) => a.deadline)
    .map((a) => ({
      task: a.task,
      owner: a.owner,
      due_date: a.deadline!,
      priority: a.priority,
      status: 'pending' as const,
    }));
}
