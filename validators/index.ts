/**
 * Validators — validate the LLM response against the expected schema
 * before persisting to the database.
 */

import type { LLMMeetingResult } from '@/lib/types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateLLMResult(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Result is not an object'] };
  }

  if (typeof data.title !== 'string') errors.push('title must be string');
  if (!Array.isArray(data.participants)) errors.push('participants must be array');
  if (!Array.isArray(data.action_items)) errors.push('action_items must be array');
  if (!Array.isArray(data.risks)) errors.push('risks must be array');
  if (!Array.isArray(data.decisions)) errors.push('decisions must be array');

  if (typeof data.confidence_score !== 'number') {
    errors.push('confidence_score must be a number');
  } else if (data.confidence_score < 0 || data.confidence_score > 1) {
    errors.push('confidence_score must be between 0.0 and 1.0');
  }

  const validSentiments = ['positive', 'neutral', 'negative', 'mixed'];
  if (data.sentiment && !validSentiments.includes(data.sentiment)) {
    errors.push(`sentiment must be one of: ${validSentiments.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

export function assertValid(data: any): asserts data is LLMMeetingResult {
  const { valid, errors } = validateLLMResult(data);
  if (!valid) throw new Error(`Validation failed: ${errors.join('; ')}`);
}
