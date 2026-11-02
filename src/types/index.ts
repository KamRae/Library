export interface BookPage {
  pageNumber: number;
  text: string;
  sentences: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  description: string;
  pages: BookPage[];
  totalPages: number;
  totalWords: number;
  estimatedMinutes: number;
  language: string;
  source: 'sample' | 'upload';
  fileName?: string;
  fileSize?: string;
  addedAt: string;
}

export interface AccentVoiceProfile {
  id: string;
  name: string;
  country: string;
  flag: string;
  langCode: string;
  samplePhrase: string;
  culturalNote: string;
  recommendedPitch: number;
  recommendedRate: number;
  gender: 'female' | 'male' | 'neutral';
  regionGroup: 'hispano' | 'international';
}

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  sentenceIndex: number;
  snippet: string;
  note?: string;
  createdAt: string;
}

export type ReaderTheme = 'alabaster' | 'sepia' | 'dark' | 'emerald';
export type ReaderFont = 'editorial' | 'reading' | 'sans';
export type ViewMode = 'reader' | 'original-pdf';
