/**
 * Transcript parsers — clean raw meeting transcripts by removing
 * timestamps, VTT headers, cue markers, and redundant whitespace.
 */

export function cleanTranscript(raw: string): string {
  return raw
    .replace(/\d{1,2}:\d{2}(:\d{2})?([.,]\d{3})?\s*-->\s*\d{1,2}:\d{2}(:\d{2})?([.,]\d{3})?/g, '')
    .replace(/\[\d{2}:\d{2}:\d{2}\]/g, '')
    .replace(/\[\d{2}:\d{2}\]/g, '')
    .replace(/\(\d{2}:\d{2}:\d{2}\)/g, '')
    .replace(/\bWEBVTT\b/g, '')
    .replace(/\b\d+\b\s*$/gm, '')
    .replace(/-->.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function detectFormat(content: string): 'vtt' | 'srt' | 'txt' | 'json' {
  if (content.includes('WEBVTT')) return 'vtt';
  if (/^\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}/m.test(content)) return 'srt';
  try {
    JSON.parse(content);
    return 'json';
  } catch {
    return 'txt';
  }
}

export function parseTranscript(content: string, format?: 'vtt' | 'srt' | 'txt' | 'json'): string {
  const detected = format ?? detectFormat(content);
  switch (detected) {
    case 'vtt':
    case 'srt':
      return cleanTranscript(content);
    case 'json':
      try {
        const parsed = JSON.parse(content);
        return cleanTranscript(typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
      } catch {
        return cleanTranscript(content);
      }
    case 'txt':
    default:
      return cleanTranscript(content);
  }
}
