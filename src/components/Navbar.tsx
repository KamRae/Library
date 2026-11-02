import { BookOpen, SlidersHorizontal, Library, Bookmark as BookmarkIcon, Upload } from 'lucide-react';
import { AccentVoiceProfile } from '../types';

interface NavbarProps {
  currentAccent: AccentVoiceProfile;
  activeTab: 'reader' | 'library' | 'bookmarks';
  onSelectTab: (tab: 'reader' | 'library' | 'bookmarks') => void;
  onOpenAccentModal: () => void;
  onOpenUploadModal: () => void;
  hasActiveBook: boolean;
  bookmarkCount: number;
}

export function Navbar({
  currentAccent,
  activeTab,
  onSelectTab,
  onOpenAccentModal,
  onOpenUploadModal,
  hasActiveBook,
  bookmarkCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('reader')}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xl font-editorial tracking-wide font-semibold text-stone-100 whitespace-nowrap">
            AcentoLibro
          </span>
        </button>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-xs tracking-wider uppercase font-medium text-stone-400">
        <button
          onClick={() => onSelectTab('reader')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-stone-100 ${
            activeTab === 'reader' && hasActiveBook ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Lector Editorial
        </button>

        <button
          onClick={() => onSelectTab('library')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-stone-100 ${
            activeTab === 'library' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          <span>Biblioteca</span>
        </button>

        <button
          onClick={onOpenAccentModal}
          className="flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-amber-300 text-stone-300"
        >
          <span className="text-base leading-none">{currentAccent.flag}</span>
          <span>Acento: {currentAccent.name}</span>
          <SlidersHorizontal className="w-3 h-3 text-stone-400 ml-0.5" />
        </button>

        <button
          onClick={() => onSelectTab('bookmarks')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-stone-100 ${
            activeTab === 'bookmarks' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <BookmarkIcon className="w-3.5 h-3.5" />
          <span>Marcadores {bookmarkCount > 0 ? `(${bookmarkCount})` : ''}</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mobile accent quick button */}
        <button
          onClick={onOpenAccentModal}
          className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-stone-300 bg-stone-800 rounded-md border border-stone-700"
          title="Cambiar acento"
        >
          <span className="text-base">{currentAccent.flag}</span>
          <span className="hidden sm:inline">{currentAccent.country}</span>
        </button>

        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Subir PDF</span>
        </button>
      </div>
    </header>
  );
}
