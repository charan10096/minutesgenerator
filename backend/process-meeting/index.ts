import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-2.0-flash";

const ANALYSIS_PROMPT = `You are an expert meeting analyst AI. Analyze the following meeting transcript and return a JSON object ONLY (no markdown, no prose) with this exact schema:

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
    { "decision": "the decision made", "decision_maker": "who made it", "reason": "why", "impact": "business impact", "confidence_score": 0.0-1.0 }
  ],
  "risks": [
    { "risk": "description", "category": "project|technical|budget|timeline|communication", "severity": "low|medium|high|critical", "mitigation": "suggested mitigation", "confidence_score": 0.0-1.0 }
  ],
  "action_items": [
    { "task": "the action", "owner": "responsible person", "department": "team", "priority": "low|medium|high|critical", "deadline": "YYYY-MM-DD or null", "estimated_effort": "e.g. 2 hours", "dependencies": "any deps", "confidence_score": 0.0-1.0 }
  ],
  "confidence_score": 0.0-1.0,
  "sentiment": "positive|neutral|negative|mixed",
  "language": "detected language code"
}

Rules:
- Return ONLY valid JSON. No code fences, no commentary.
- If a field has no data, return an empty array or empty string (deadline can be null).
- Confidence scores are 0.0 to 1.0.
- Infer owners and departments from context when not explicitly stated.
- Parse relative dates into YYYY-MM-DD using today as reference.
- Remove timestamps, duplicate spaces, and filler.
- Detect the dominant language.

Transcript:
"""
{{TRANSCRIPT}}
"""`;

function cleanTranscript(raw: string): string {
  return raw
    .replace(/\d{1,2}:\d{2}(:\d{2})?\s*[-–—>]\s*\d{1,2}:\d{2}(:\d{2})?/g, "")
    .replace(/\[\d{2}:\d{2}:\d{2}\]/g, "")
    .replace(/\[\d{2}:\d{2}\]/g, "")
    .replace(/\(\d{2}:\d{2}:\d{2}\)/g, "")
    .replace(/\bWEBVTT\b/g, "")
    .replace(/\b\d+\b\s*$/gm, "")
    .replace(/-->.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function buildPrompt(transcript: string): string {
  return ANALYSIS_PROMPT.replace("{{TRANSCRIPT}}", transcript.slice(0, 60000));
}

function extractJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function validateResult(data: any): string[] {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return ["Result is not an object"];
  if (typeof data.title !== "string") errors.push("title must be string");
  if (!Array.isArray(data.participants)) errors.push("participants must be array");
  if (!Array.isArray(data.action_items)) errors.push("action_items must be array");
  if (!Array.isArray(data.risks)) errors.push("risks must be array");
  if (!Array.isArray(data.decisions)) errors.push("decisions must be array");
  return errors;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { meetingId } = await req.json();
    if (!meetingId) {
      return new Response(JSON.stringify({ error: "meetingId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Mark processing
    await supabase.from("meetings").update({ status: "processing" }).eq("id", meetingId);

    const { data: meeting, error: meetingErr } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", meetingId)
      .maybeSingle();

    if (meetingErr || !meeting) {
      return new Response(JSON.stringify({ error: "Meeting not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!meeting.raw_transcript || meeting.raw_transcript.trim().length === 0) {
      await supabase.from("meetings").update({ status: "failed", processing_error: "Empty transcript" }).eq("id", meetingId);
      return new Response(JSON.stringify({ error: "Empty transcript" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clean = cleanTranscript(meeting.raw_transcript);
    await supabase.from("meetings").update({ clean_transcript: clean }).eq("id", meetingId);

    if (!GEMINI_API_KEY) {
      await supabase.from("meetings").update({ status: "failed", processing_error: "Gemini API key not configured" }).eq("id", meetingId);
      return new Response(JSON.stringify({ error: "Gemini API key not configured. Set the GEMINI_API_KEY secret." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: buildPrompt(clean) }] },
          ],
          systemInstruction: { parts: [{ text: "You are an expert meeting analyst. Return only valid JSON." }] },
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      await supabase.from("meetings").update({ status: "failed", processing_error: `Gemini error: ${errText}` }).eq("id", meetingId);
      return new Response(JSON.stringify({ error: `Gemini request failed: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    let result: any;
    try {
      result = extractJson(content);
    } catch (e) {
      await supabase.from("meetings").update({ status: "failed", processing_error: "Failed to parse LLM JSON" }).eq("id", meetingId);
      return new Response(JSON.stringify({ error: "Failed to parse LLM response as JSON" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validationErrors = validateResult(result);
    if (validationErrors.length > 0) {
      await supabase.from("meetings").update({ status: "failed", processing_error: validationErrors.join("; ") }).eq("id", meetingId);
      return new Response(JSON.stringify({ error: "Validation failed", details: validationErrors }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate action items
    const seenTasks = new Set<string>();
    const actionItems = (result.action_items || []).filter((a: any) => {
      const key = (a.task || "").toLowerCase().trim();
      if (seenTasks.has(key)) return false;
      seenTasks.add(key);
      return true;
    });

    // Persist summary
    await supabase.from("meeting_summaries").insert({
      meeting_id: meetingId,
      executive_summary: result.executive_summary || "",
      detailed_summary: result.detailed_summary || "",
      bullet_summary: (result.bullet_summary || []).join("\n"),
      timeline_summary: result.timeline_summary || "",
      highlights: result.highlights || [],
      agenda: result.agenda || [],
      discussion_points: result.discussion_points || [],
    });

    // Persist action items
    if (actionItems.length > 0) {
      await supabase.from("action_items").insert(
        actionItems.map((a: any) => ({
          meeting_id: meetingId,
          task: a.task || "Untitled task",
          owner: a.owner || null,
          department: a.department || null,
          priority: ["low", "medium", "high", "critical"].includes(a.priority) ? a.priority : "medium",
          status: "pending",
          deadline: a.deadline || null,
          estimated_effort: a.estimated_effort || null,
          dependencies: a.dependencies || null,
          confidence_score: a.confidence_score ?? null,
        }))
      );
    }

    // Persist risks
    if (result.risks?.length > 0) {
      await supabase.from("risks").insert(
        result.risks.map((r: any) => ({
          meeting_id: meetingId,
          risk: r.risk || "Untitled risk",
          category: ["project", "technical", "budget", "timeline", "communication"].includes(r.category) ? r.category : "project",
          severity: ["low", "medium", "high", "critical"].includes(r.severity) ? r.severity : "medium",
          mitigation: r.mitigation || null,
          confidence_score: r.confidence_score ?? null,
        }))
      );
    }

    // Persist decisions
    if (result.decisions?.length > 0) {
      await supabase.from("decisions").insert(
        result.decisions.map((d: any) => ({
          meeting_id: meetingId,
          decision: d.decision || "Untitled decision",
          decision_maker: d.decision_maker || null,
          reason: d.reason || null,
          impact: d.impact || null,
          confidence_score: d.confidence_score ?? null,
        }))
      );
    }

    // Persist deadlines
    const deadlines = actionItems.filter((a: any) => a.deadline).map((a: any) => ({
      meeting_id: meetingId,
      task: a.task,
      owner: a.owner || null,
      due_date: a.deadline,
      priority: ["low", "medium", "high", "critical"].includes(a.priority) ? a.priority : "medium",
      status: "pending",
    }));
    if (deadlines.length > 0) {
      await supabase.from("deadlines").insert(deadlines);
    }

    // Update meeting
    await supabase.from("meetings").update({
      status: "completed",
      title: result.title || meeting.title,
      participants: result.participants || [],
      language: result.language || null,
      confidence_score: result.confidence_score ?? null,
      sentiment: result.sentiment || null,
    }).eq("id", meetingId);

    // Track API usage
    await supabase.from("api_usage").insert({
      meeting_id: meetingId,
      model: GEMINI_MODEL,
      prompt_tokens: geminiData.usageMetadata?.promptTokenCount ?? 0,
      completion_tokens: geminiData.usageMetadata?.candidatesTokenCount ?? 0,
      total_tokens: geminiData.usageMetadata?.totalTokenCount ?? 0,
      cost: ((geminiData.usageMetadata?.totalTokenCount ?? 0) / 1000) * 0.000075,
    });

    // Notification
    await supabase.from("notifications").insert({
      type: "processing_complete",
      title: "Meeting processed",
      message: `"${result.title || meeting.title}" has been analyzed.`,
      meeting_id: meetingId,
    });

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
