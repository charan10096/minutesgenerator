export const MEETING_ANALYSIS_PROMPT = `You are an expert meeting analyst AI. Analyze the following meeting transcript and return a JSON object ONLY (no markdown, no prose) with this exact schema:

{
  "title": "concise meeting title",
  "participants": ["list of participant names mentioned"],
  "agenda": ["agenda items discussed"],
  "executive_summary": "2-3 paragraph executive summary",
  "detailed_summary": "detailed multi-paragraph summary of the discussion",
  "bullet_summary": ["key points as bullet strings"],
  "timeline_summary": "chronological narrative of the meeting flow",
  "highlights": ["notable highlights"],
  "discussion_points": ["main discussion points"],
  "decisions": [
    {
      "decision": "the decision made",
      "decision_maker": "who made it",
      "reason": "why it was decided",
      "impact": "business impact",
      "confidence_score": 0.0-1.0
    }
  ],
  "risks": [
    {
      "risk": "description of the risk",
      "category": "project|technical|budget|timeline|communication",
      "severity": "low|medium|high|critical",
      "mitigation": "suggested mitigation",
      "confidence_score": 0.0-1.0
    }
  ],
  "action_items": [
    {
      "task": "the action to take",
      "owner": "responsible person",
      "department": "team/department",
      "priority": "low|medium|high|critical",
      "deadline": "YYYY-MM-DD or null if none mentioned",
      "estimated_effort": "e.g. 2 hours, 3 days",
      "dependencies": "any dependencies",
      "confidence_score": 0.0-1.0
    }
  ],
  "confidence_score": 0.0-1.0,
  "sentiment": "positive|neutral|negative|mixed",
  "language": "detected language code (e.g. en)"
}

Rules:
- Return ONLY valid JSON. No code fences, no commentary.
- If a field has no data, return an empty array or empty string, never null (except deadline which can be null).
- Confidence scores are 0.0 to 1.0 based on extraction certainty.
- Infer owners and departments from context when not explicitly stated.
- For deadlines, parse relative dates (e.g. "next Friday") into YYYY-MM-DD format using today as reference.
- Remove timestamps, duplicate spaces, and filler from your analysis.
- Detect the dominant language.

Transcript:
"""
{{TRANSCRIPT}}
"""`;

export function buildAnalysisPrompt(transcript: string): string {
  return MEETING_ANALYSIS_PROMPT.replace('{{TRANSCRIPT}}', transcript.slice(0, 60000));
}

export const PROMPT_TEMPLATES = {
  summary: MEETING_ANALYSIS_PROMPT,
  actionExtraction: 'Use the action_items schema from the main analysis prompt.',
  riskDetection: 'Use the risks schema from the main analysis prompt.',
  decisionDetection: 'Use the decisions schema from the main analysis prompt.',
  deadlineExtraction: 'Use the deadline field within action_items from the main analysis prompt.',
  jsonValidation: 'Validate that the response parses as JSON and matches the LLMMeetingResult schema.',
  promptOptimization: 'Keep prompts under 2000 tokens. Use structured schemas. Request JSON only.',
};
