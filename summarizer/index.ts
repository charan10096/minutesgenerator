/**
 * Summarizer — builds the LLM prompt from a cleaned transcript
 * and defines the expected response schema.
 */

import { MEETING_ANALYSIS_PROMPT } from '@/prompts/meeting-analysis';
import type { LLMMeetingResult } from '@/lib/types';

export { MEETING_ANALYSIS_PROMPT };

export function buildSummaryPrompt(transcript: string): string {
  return MEETING_ANALYSIS_PROMPT.replace('{{TRANSCRIPT}}', transcript.slice(0, 60000));
}

export interface SummarizerOptions {
  maxTranscriptLength?: number;
  temperature?: number;
}

export function defaultSummarizerOptions(): SummarizerOptions {
  return {
    maxTranscriptLength: 60000,
    temperature: 0.3,
  };
}

export function parseSummaryResponse(rawText: string): LLMMeetingResult {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return JSON.parse(cleaned.slice(start, end + 1));
}
