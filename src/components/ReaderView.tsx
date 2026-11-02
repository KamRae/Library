import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  Type,
  Maximize2,
  Minimize2,
  Volume2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Book, ReaderTheme, ReaderFont, Bookmark } from '../types';

interface ReaderViewProps {
  book: Book;
  currentPage: number;
  currentSentenceIdx: number;
  isPlaying: boolean;
  theme: ReaderTheme;
  font: ReaderFont;
  fontSize: number;
  bookmarks: Bookmark[];
  onPageChange: (newPage: number) => void;
  onSentenceClick: (sentenceIdx: number) => void;
  onToggleBookmark: (page: number, sentenceIdx: number, textSnippet: string) => void;
  onThemeChange: (theme: ReaderTheme) => void;
  onFontChange: (font: ReaderFont) => void;
  onFontSizeChange: (delta: number) => void;
}

export function ReaderView({
  book,
  currentPage,
  currentSentenceIdx,
  isPlaying,
  theme,
  font,
  fontSize,
  bookmarks,
  onPageChange,
  onSentenceClick,
  onToggleBookmark,
  onThemeChange,
  onFontChange,
  onFontSizeChange,
}: ReaderViewProps) {
  const activeSentenceRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-scroll to active sentence smoothly during playback
  useEffect(() => {
    if (autoScroll && isPlaying && activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentSentenceIdx, isPlaying, autoScroll]);

  const pageData = book.pages.find((p) => p.pageNumber === currentPage) || book.pages[0];

  // Theme styling definitions
  const themeClasses: Record<ReaderTheme, { bg: string; text: string; card: string; highlight: string; border: string }> = {
    alabaster: {
      bg: 'bg-[#FBF9F5]',
      text: 'text-[#1C1917]',
      card: 'bg-white/70 border-stone-200/80',
      highlight: 'bg-amber-200/60 text-stone-950 font-medium rounded px-1 -mx-1 shadow-xs',
      border: 'border-stone-300/80',
    },
    sepia: {
      bg: 'bg-[#F5EEDB]',
      text: 'text-[#2D2319]',
      card: 'bg-[#EFE5CE]/70 border-[#DFCDB2]',
      highlight: 'bg-amber-300/70 text-[#1C140A] font-medium rounded px-1 -mx-1 shadow-xs',
      border: 'border-[#DFCDB2]',
    },
    dark: {
      bg: 'bg-[#181A1B]',
      text: 'text-[#E5E7EB]',
      card: 'bg-[#212427]/70 border-stone-700/60',
      highlight: 'bg-amber-500/25 text-amber-200 font-medium rounded px-1 -mx-1 ring-1 ring-amber-500/30',
      border: 'border-stone-700/60',
    },
    emerald: {
      bg: 'bg-[#0E1A18]',
      text: 'text-[#E0EBE6]',
      card: 'bg-[#132421]/70 border-emerald-900/60',
      highlight: 'bg-emerald-500/25 text-emerald-200 font-medium rounded px-1 -mx-1 ring-1 ring-emerald-500/30',
      border: 'border-emerald-900/60',
    },
  };

  const currentThemeStyle = themeClasses[theme];

  // Font family helper
  const fontClass =
    font === 'editorial'
      ? 'font-editorial'
      : font === 'reading'
      ? 'font-reading'
      : 'font-sans';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-[calc(100vh-65px)] pb-36 transition-colors duration-300 ${currentThemeStyle.bg} ${currentThemeStyle.text}`}
    >
      {/* Reader Utility Ribbon */}
      <div className={`sticky top-[57px] z-20 backdrop-blur-md border-b ${currentThemeStyle.border} bg-opacity-90 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 text-xs`}>
        {/* Left: Book title and page status */}
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{book.title}</span>
          <span className="opacity-50" aria-hidden="true">·</span>
          <span className="opacity-75 font-mono tabular-nums whitespace-nowrap">
            Página {currentPage} de {book.totalPages}
          </span>
        </div>

        {/* Center: Page Jumper */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono tabular-nums px-2 py-0.5 text-xs font-semibold">
            {currentPage} / {book.totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(book.totalPages, currentPage + 1))}
            disabled={currentPage >= book.totalPages}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Typography & Theme Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Font Family Selector */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg border border-black/10 dark:border-white/10">
            <button
              onClick={() => onFontChange('editorial')}
              className={`px-2 py-1 rounded text-[11px] font-editorial ${
                font === 'editorial' ? 'bg-black/10 dark:bg-white/20 font-bold' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Cormorant
            </button>
            <button
              onClick={() => onFontChange('reading')}
              className={`px-2 py-1 rounded text-[11px] font-reading ${
                font === 'reading' ? 'bg-black/10 dark:bg-white/20 font-bold' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Serif
            </button>
            <button
              onClick={() => onFontChange('sans')}
              className={`px-2 py-1 rounded text-[11px] font-sans ${
                font === 'sans' ? 'bg-black/10 dark:bg-white/20 font-bold' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Sans
            </button>
          </div>

          {/* Font Size Adjusters */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onFontSizeChange(-1)}
              disabled={fontSize <= 14}
              className="px-1.5 py-1 text-xs rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
              title="Reducir tamaño de letra"
            >
              A-
            </button>
            <span className="text-[11px] font-mono tabular-nums opacity-60 w-5 text-center">
              {fontSize}
            </span>
            <button
              onClick={() => onFontSizeChange(1)}
              disabled={fontSize >= 28}
              className="px-1.5 py-1 text-xs rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
              title="Aumentar tamaño de letra"
            >
              A+
            </button>
          </div>

          {/* Theme Palette Buttons */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-black/10 dark:border-white/10">
            <button
              onClick={() => onThemeChange('alabaster')}
              className={`w-4 h-4 rounded-full border border-stone-300 bg-[#FBF9F5] shadow-xs ${
                theme === 'alabaster' ? 'ring-2 ring-amber-500 scale-110' : ''
              }`}
              title="Papel Alabastro"
            />
            <button
              onClick={() => onThemeChange('sepia')}
              className={`w-4 h-4 rounded-full border border-[#DFCDB2] bg-[#F5EEDB] shadow-xs ${
                theme === 'sepia' ? 'ring-2 ring-amber-500 scale-110' : ''
              }`}
              title="Pergamino Sepia"
            />
            <button
              onClick={() => onThemeChange('dark')}
              className={`w-4 h-4 rounded-full border border-stone-600 bg-[#181A1B] shadow-xs ${
                theme === 'dark' ? 'ring-2 ring-amber-500 scale-110' : ''
              }`}
              title="Noche Tinta"
            />
            <button
              onClick={() => onThemeChange('emerald')}
              className={`w-4 h-4 rounded-full border border-emerald-800 bg-[#0E1A18] shadow-xs ${
                theme === 'emerald' ? 'ring-2 ring-emerald-500 scale-110' : ''
              }`}
              title="Bosque Suave"
            />
          </div>

          {/* Auto Scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`hidden md:flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
              autoScroll ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium' : 'opacity-60 hover:opacity-100'
            }`}
            title="Seguimiento automático de la lectura en pantalla"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto-seguir</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
            title="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Editorial Canvas */}
      <main className="max-w-3xl mx-auto px-6 sm:px-12 pt-10 pb-16">
        {/* Book Header for Page 1 */}
        {currentPage === 1 && (
          <header className="mb-10 pb-8 border-b border-black/10 dark:border-white/10 text-center">
            <span className="text-xs uppercase tracking-widest opacity-60 font-medium">
              Lectura con Acento Personalizado
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-editorial font-medium tracking-tight mt-3 mb-2 text-balance">
              {book.title}
            </h1>
            <p className="text-sm sm:text-base font-editorial italic opacity-80">
              {book.author}
            </p>
          </header>
        )}

        {/* Prose Section with Synchronized Sentence Highlighting */}
        <article
          className={`space-y-6 leading-relaxed transition-all duration-150 ${fontClass}`}
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {pageData.sentences.map((sentence, idx) => {
            const isActive = idx === currentSentenceIdx;
            const isBookmarked = bookmarks.some(
              (b) => b.bookId === book.id && b.page === currentPage && b.sentenceIndex === idx
            );

            return (
              <span
                key={idx}
                ref={isActive ? activeSentenceRef : null}
                onClick={() => onSentenceClick(idx)}
                className={`relative group inline cursor-pointer transition-all duration-200 rounded px-1 py-0.5 ${
                  isActive ? currentThemeStyle.highlight : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                title="Haz clic para escuchar desde esta oración"
              >
                {/* Active Sentence Indicator */}
                {isActive && isPlaying && (
                  <span className="inline-flex items-center align-middle mr-1.5 text-amber-500 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5 inline" />
                  </span>
                )}

                {/* Drop Cap on Page 1 Sentence 0 */}
                {currentPage === 1 && idx === 0 ? (
                  <span>
                    <span className="text-5xl sm:text-6xl font-editorial font-bold float-left mr-3 mt-1 leading-none text-amber-700 dark:text-amber-400">
                      {sentence.charAt(0)}
                    </span>
                    {sentence.slice(1)}
                  </span>
                ) : (
                  <span>{sentence}</span>
                )}
                {' '}

                {/* Inline Quick Bookmark Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(currentPage, idx, sentence);
                  }}
                  className={`inline-flex items-center ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                    isBookmarked ? 'opacity-100 text-amber-500' : 'text-stone-400 hover:text-amber-500'
                  }`}
                  title={isBookmarked ? 'Quitar marcador' : 'Guardar marcador'}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <BookmarkIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </span>
            );
          })}
        </article>

        {/* Page Footer Navigation */}
        <div className="mt-14 pt-8 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs opacity-75 font-mono">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Página anterior</span>
          </button>

          <span>
            {currentPage} de {book.totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(book.totalPages, currentPage + 1))}
            disabled={currentPage >= book.totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>Página siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>
    </div>
  );
}
