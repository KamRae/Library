/**
 * Splits text into readable sentences for smooth speech synthesis pacing.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return [];

  // Clean excessive whitespace while preserving paragraph flow
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim();

  // Regex to split on sentence ends (. ! ? ...) without breaking abbreviations like Dr. or pág.
  const rawSentences = normalized
    .split(/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÑ"«“\d])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // If text is one big block without punctuation, break by reasonable chunks or newlines
  if (rawSentences.length <= 1 && normalized.length > 200) {
    const byLines = normalized.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (byLines.length > 1) return byLines;
  }

  return rawSentences.length > 0 ? rawSentences : [normalized];
}

/**
 * Counts total words in text
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates reading time in minutes at average speech speed (~140 wpm)
 */
export function estimateReadingMinutes(totalWords: number, rate: number = 1.0): number {
  const wpm = 140 * rate;
  return Math.max(1, Math.ceil(totalWords / wpm));
}
