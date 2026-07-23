import type { Meeting, MeetingSummary, ActionItem, Risk, Decision, Deadline, ExportFormat } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/format';

export interface MeetingExportData {
  meeting: Meeting;
  summary: MeetingSummary | null;
  actions: ActionItem[];
  risks: Risk[];
  decisions: Decision[];
  deadlines: Deadline[];
}

export function exportMeeting(format: ExportFormat, data: MeetingExportData): { content: string; filename: string; mime: string } {
  const base = data.meeting.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  switch (format) {
    case 'json':
      return {
        content: JSON.stringify(data, null, 2),
        filename: `${base}.json`,
        mime: 'application/json',
      };
    case 'csv':
      return { content: toCSV(data), filename: `${base}.csv`, mime: 'text/csv' };
    case 'markdown':
    case 'pdf':
    case 'docx':
    default:
      return { content: toMarkdown(data), filename: `${base}.md`, mime: 'text/markdown' };
  }
}

function toMarkdown(d: MeetingExportData): string {
  const lines: string[] = [];
  lines.push(`# ${d.meeting.title}`);
  lines.push('');
  lines.push(`**Date:** ${formatDateTime(d.meeting.created_at)}`);
  if (d.meeting.participants.length) lines.push(`**Participants:** ${d.meeting.participants.join(', ')}`);
  if (d.meeting.language) lines.push(`**Language:** ${d.meeting.language}`);
  if (d.meeting.sentiment) lines.push(`**Sentiment:** ${d.meeting.sentiment}`);
  if (d.meeting.confidence_score != null) lines.push(`**Confidence:** ${(d.meeting.confidence_score * 100).toFixed(0)}%`);
  lines.push('');

  if (d.summary?.executive_summary) {
    lines.push('## Executive Summary');
    lines.push(d.summary.executive_summary);
    lines.push('');
  }
  if (d.summary?.agenda.length) {
    lines.push('## Agenda');
    d.summary.agenda.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    lines.push('');
  }
  if (d.summary?.detailed_summary) {
    lines.push('## Detailed Summary');
    lines.push(d.summary.detailed_summary);
    lines.push('');
  }
  if (d.summary?.bullet_summary) {
    lines.push('## Bullet Summary');
    d.summary.bullet_summary.split('\n').filter(Boolean).forEach((b) => lines.push(`- ${b.replace(/^[-•]\s*/, '')}`));
    lines.push('');
  }
  if (d.summary?.highlights.length) {
    lines.push('## Highlights');
    d.summary.highlights.forEach((h) => lines.push(`- ${h}`));
    lines.push('');
  }
  if (d.decisions.length) {
    lines.push('## Decisions');
    d.decisions.forEach((dec) => {
      lines.push(`### ${dec.decision}`);
      if (dec.decision_maker) lines.push(`- **Decision maker:** ${dec.decision_maker}`);
      if (dec.reason) lines.push(`- **Reason:** ${dec.reason}`);
      if (dec.impact) lines.push(`- **Impact:** ${dec.impact}`);
      lines.push('');
    });
  }
  if (d.risks.length) {
    lines.push('## Risks');
    lines.push('| Risk | Category | Severity | Mitigation |');
    lines.push('|------|----------|----------|------------|');
    d.risks.forEach((r) => {
      lines.push(`| ${r.risk} | ${r.category} | ${r.severity} | ${r.mitigation || ''} |`);
    });
    lines.push('');
  }
  if (d.actions.length) {
    lines.push('## Action Items');
    lines.push('| Task | Owner | Priority | Status | Deadline |');
    lines.push('|------|-------|----------|--------|----------|');
    d.actions.forEach((a) => {
      lines.push(`| ${a.task} | ${a.owner || ''} | ${a.priority} | ${a.status} | ${a.deadline ? formatDate(a.deadline) : ''} |`);
    });
    lines.push('');
  }
  if (d.deadlines.length) {
    lines.push('## Deadlines');
    d.deadlines.forEach((dl) => {
      lines.push(`- **${dl.task}** — ${formatDate(dl.due_date)} (${dl.priority}, ${dl.status})`);
    });
  }
  return lines.join('\n');
}

function toCSV(d: MeetingExportData): string {
  const rows: string[] = [];
  rows.push('Type,Title/Task,Owner,Priority,Status,Deadline,Category/Department,Details');
  d.actions.forEach((a) => {
    rows.push(`Action Item,"${escapeCSV(a.task)}","${a.owner || ''}",${a.priority},${a.status},${a.deadline || ''},"${a.department || ''}","${escapeCSV(a.dependencies || '')}"`);
  });
  d.decisions.forEach((dec) => {
    rows.push(`Decision,"${escapeCSV(dec.decision)}","${dec.decision_maker || ''}",,,,"${escapeCSV(dec.impact || '')}"`);
  });
  d.risks.forEach((r) => {
    rows.push(`Risk,"${escapeCSV(r.risk)}",,${r.severity},,,"${r.category}","${escapeCSV(r.mitigation || '')}"`);
  });
  d.deadlines.forEach((dl) => {
    rows.push(`Deadline,"${escapeCSV(dl.task)}","${dl.owner || ''}",${dl.priority},${dl.status},${dl.due_date},,`);
  });
  return rows.join('\n');
}

function escapeCSV(s: string): string {
  return s.replace(/"/g, '""').replace(/\n/g, ' ');
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
