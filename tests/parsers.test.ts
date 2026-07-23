import { describe, it, expect } from 'vitest';
import { cleanTranscript, detectFormat, parseTranscript } from '../parsers';

describe('cleanTranscript', () => {
  it('removes VTT timestamps', () => {
    const input = 'WEBVTT\n\n00:00:01.000 --> 00:00:05.000\nHello world';
    const result = cleanTranscript(input);
    expect(result).not.toContain('WEBVTT');
    expect(result).not.toContain('00:00:01');
    expect(result).toContain('Hello world');
  });

  it('removes SRT-style timestamps', () => {
    const input = '1\n00:00:01,000 --> 00:00:05,000\nHello world';
    const result = cleanTranscript(input);
    expect(result).toContain('Hello world');
    expect(result).not.toContain('00:00:01,000');
  });

  it('collapses excessive whitespace', () => {
    const input = 'Hello    world\n\n\n\nFoo';
    const result = cleanTranscript(input);
    expect(result).not.toContain('    ');
    expect(result).not.toContain('\n\n\n');
  });
});

describe('detectFormat', () => {
  it('detects VTT format', () => {
    expect(detectFormat('WEBVTT\nHello')).toBe('vtt');
  });

  it('detects SRT format', () => {
    expect(detectFormat('1\n00:00:01,000 --> 00:00:05,000\nHello')).toBe('srt');
  });

  it('detects JSON format', () => {
    expect(detectFormat('{"text":"hello"}')).toBe('json');
  });

  it('defaults to txt', () => {
    expect(detectFormat('Just plain text')).toBe('txt');
  });
});

describe('parseTranscript', () => {
  it('parses VTT and returns cleaned text', () => {
    const result = parseTranscript('WEBVTT\n\n00:01 --> 00:05\nHello');
    expect(result).toContain('Hello');
    expect(result).not.toContain('WEBVTT');
  });
});
