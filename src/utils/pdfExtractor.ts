import * as pdfjsLib from 'pdfjs-dist';
import { Book, BookPage } from '../types';
import { splitIntoSentences, countWords, estimateReadingMinutes } from './textSplitter';

// Setup pdf.js worker URL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface ExtractionProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

export async function extractBookFromPdf(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<Book> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let metadataTitle = '';
  let metadataAuthor = '';

  try {
    const meta = await pdf.getMetadata();
    const info = meta?.info as Record<string, unknown> | undefined;
    if (info) {
      if (typeof info.Title === 'string' && info.Title.trim()) {
        metadataTitle = info.Title.trim();
      }
      if (typeof info.Author === 'string' && info.Author.trim()) {
        metadataAuthor = info.Author.trim();
      }
    }
  } catch (err) {
    console.warn('Could not read PDF metadata:', err);
  }

  const cleanFileName = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
  const bookTitle = metadataTitle || cleanFileName || 'Libro sin título';
  const bookAuthor = metadataAuthor || 'Autor desconocido';

  const pages: BookPage[] = [];
  let coverDataUrl: string | undefined = undefined;

  // Extract page 1 thumbnail canvas
  try {
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await firstPage.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      }).promise;
      coverDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    }
  } catch (err) {
    console.warn('Could not generate cover preview:', err);
  }

  // Extract text from each page
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages: numPages,
        status: `Extrayendo página ${pageNum} de ${numPages}...`,
      });
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items into coherent paragraphs
    const items = textContent.items as Array<{ str?: string; hasEOL?: boolean }>;
    const strings: string[] = [];

    for (const item of items) {
      if (item && typeof item.str === 'string') {
        strings.push(item.str);
        if (item.hasEOL) {
          strings.push('\n');
        } else {
          strings.push(' ');
        }
      }
    }

    const rawText = strings
      .join('')
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    const pageText = rawText || `[Página ${pageNum} sin texto seleccionable (imagen o escaneo)]`;
    const sentences = splitIntoSentences(pageText);

    pages.push({
      pageNumber: pageNum,
      text: pageText,
      sentences: sentences.length > 0 ? sentences : [pageText],
    });
  }

  const totalWords = pages.reduce((sum, p) => sum + countWords(p.text), 0);
  const estimatedMinutes = estimateReadingMinutes(totalWords);
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

  return {
    id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: bookTitle,
    author: bookAuthor,
    coverUrl: coverDataUrl,
    description: `Documento PDF importado con ${numPages} páginas y ${totalWords.toLocaleString()} palabras. Listo para lectura con acento personalizado.`,
    pages,
    totalPages: numPages,
    totalWords,
    estimatedMinutes,
    language: 'es',
    source: 'upload',
    fileName: file.name,
    fileSize: fileSizeMb,
    addedAt: new Date().toISOString().split('T')[0],
  };
}
