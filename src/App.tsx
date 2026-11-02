import { useState, useEffect, useCallback, useTransition } from 'react';
import confetti from 'canvas-confetti';
import { Book, AccentVoiceProfile, Bookmark, ReaderTheme, ReaderFont } from './types';
import { SAMPLE_BOOKS } from './data/sampleBooks';
import { ACCENT_PROFILES } from './data/accentProfiles';
import { speechEngine } from './services/speechEngine';
import { Navbar } from './components/Navbar';
import { ReaderView } from './components/ReaderView';
import { PlayerBar } from './components/PlayerBar';
import { AccentModal } from './components/AccentModal';
import { UploadModal } from './components/UploadModal';
import { LibraryModal } from './components/LibraryModal';
import { BookmarksModal } from './components/BookmarksModal';

const LOCAL_STORAGE_BOOKS_KEY = 'acentolibro_user_books';
const LOCAL_STORAGE_BOOKMARKS_KEY = 'acentolibro_user_bookmarks';
const LOCAL_STORAGE_SETTINGS_KEY = 'acentolibro_user_settings';

export default function App() {
  // Books list
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...SAMPLE_BOOKS, ...parsed];
      }
    } catch (e) {
      console.warn('Failed to load books from localStorage:', e);
    }
    return SAMPLE_BOOKS;
  });

  const [currentBookId, setCurrentBookId] = useState<string>('quijote-cervantes');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Accent & Voice settings
  const [currentAccent, setCurrentAccent] = useState<AccentVoiceProfile>(ACCENT_PROFILES[0]);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number | null>(null);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<'reader' | 'library' | 'bookmarks'>('reader');
  const [isAccentModalOpen, setIsAccentModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Reader Preferences
  const [theme, setTheme] = useState<ReaderTheme>('alabaster');
  const [font, setFont] = useState<ReaderFont>('editorial');
  const [fontSize, setFontSize] = useState<number>(18);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current Book lookup
  const currentBook = books.find((b) => b.id === currentBookId) || books[0];
  const pageData = currentBook.pages.find((p) => p.pageNumber === currentPage) || currentBook.pages[0];

  // Save uploaded books to localStorage
  const saveUploadedBooks = (updatedBooks: Book[]) => {
    const customOnly = updatedBooks.filter((b) => b.source === 'upload');
    try {
      localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('Could not save books to localStorage:', e);
    }
  };

  // Sync speech engine with current page sentences
  const syncPageToEngine = useCallback(
    (page: number, sentenceIdx: number = 0, autoStart: boolean = false) => {
      const targetPageData = currentBook.pages.find((p) => p.pageNumber === page) || currentBook.pages[0];
      if (!targetPageData) return;

      speechEngine.loadSentences(targetPageData.sentences, sentenceIdx);
      setCurrentSentenceIdx(sentenceIdx);

      if (autoStart) {
        speechEngine.play();
      }
    },
    [currentBook]
  );

  // Configure SpeechEngine Callbacks
  useEffect(() => {
    speechEngine.setCallbacks({
      onSentenceChange: (idx) => {
        setCurrentSentenceIdx(idx);
      },
      onStateChange: (playing) => {
        setIsPlaying(playing);
      },
      onPageComplete: () => {
        // Automatically turn to the next page!
        if (currentPage < currentBook.totalPages) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          syncPageToEngine(nextPage, 0, true);
        } else {
          // Completed the book!
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      },
      onError: (msg) => {
        console.warn('Speech error:', msg);
      },
    });
  }, [currentPage, currentBook, syncPageToEngine]);

  // Load sentences when book or page changes
  useEffect(() => {
    syncPageToEngine(currentPage, currentSentenceIdx, false);
  }, [currentBookId, currentPage]);

  // Handle Playback Controls
  const handlePlay = () => {
    speechEngine.play();
  };

  const handlePause = () => {
    speechEngine.pause();
  };

  const handleNextSentence = () => {
    speechEngine.nextSentence();
  };

  const handlePrevSentence = () => {
    speechEngine.prevSentence();
  };

  const handleSentenceClick = (sentenceIdx: number) => {
    speechEngine.playSentenceAt(sentenceIdx);
  };

  const handlePageChange = (newPage: number) => {
    speechEngine.stop();
    setCurrentPage(newPage);
    setCurrentSentenceIdx(0);
    syncPageToEngine(newPage, 0, isPlaying);
  };

  // Accent and Voice updates
  const handleSelectAccent = (profile: AccentVoiceProfile) => {
    setCurrentAccent(profile);
    speechEngine.setProfile(profile);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    speechEngine.setRate(rate);
  };

  const handlePitchChange = (p: number) => {
    setPitch(p);
    speechEngine.setPitch(p);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    speechEngine.setVolume(v);
  };

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerMinutes === null) {
      setSleepRemainingSeconds(null);
      return;
    }

    setSleepRemainingSeconds(sleepTimerMinutes * 60);

    const interval = setInterval(() => {
      setSleepRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          speechEngine.pause();
          setSleepTimerMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Bookmark Toggle
  const handleToggleBookmark = (page: number, sentenceIdx: number, snippet: string) => {
    const existingIndex = bookmarks.findIndex(
      (b) => b.bookId === currentBook.id && b.page === page && b.sentenceIndex === sentenceIdx
    );

    let updated: Bookmark[];
    if (existingIndex >= 0) {
      updated = bookmarks.filter((_, i) => i !== existingIndex);
    } else {
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}`,
        bookId: currentBook.id,
        page,
        sentenceIndex: sentenceIdx,
        snippet: snippet.length > 140 ? snippet.slice(0, 140) + '...' : snippet,
        createdAt: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      };
      updated = [newBookmark, ...bookmarks];
    }

    setBookmarks(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save bookmark:', e);
    }
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    const updated = bookmarks.filter((b) => b.id !== bookmarkId);
    setBookmarks(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save bookmark deletion:', e);
    }
  };

  const handleSelectBookmark = (bm: Bookmark) => {
    setCurrentBookId(bm.bookId);
    setCurrentPage(bm.page);
    setActiveTab('reader');
    syncPageToEngine(bm.page, bm.sentenceIndex, true);
  };

  // Uploaded book handler
  const handleBookLoaded = (newBook: Book) => {
    const updatedBooks = [newBook, ...books];
    setBooks(updatedBooks);
    saveUploadedBooks(updatedBooks);
    setCurrentBookId(newBook.id);
    setCurrentPage(1);
    setCurrentSentenceIdx(0);
    setActiveTab('reader');
    syncPageToEngine(1, 0, false);
  };

  const handleDeleteBook = (bookId: string) => {
    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    saveUploadedBooks(updated);
    if (currentBookId === bookId) {
      setCurrentBookId('quijote-cervantes');
      setCurrentPage(1);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    speechEngine.stop();
    setCurrentBookId(sampleId);
    setCurrentPage(1);
    setCurrentSentenceIdx(0);
    setActiveTab('reader');
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          handlePause();
        } else {
          handlePlay();
        }
      } else if (e.code === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleNextSentence();
      } else if (e.code === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlePrevSentence();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' || theme === 'emerald' ? 'dark' : ''}`}>
      {/* 3-Zone Compliant Navbar */}
      <Navbar
        currentAccent={currentAccent}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAccentModal={() => setIsAccentModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        hasActiveBook={!!currentBook}
        bookmarkCount={bookmarks.length}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'reader' && (
          <ReaderView
            book={currentBook}
            currentPage={currentPage}
            currentSentenceIdx={currentSentenceIdx}
            isPlaying={isPlaying}
            theme={theme}
            font={font}
            fontSize={fontSize}
            bookmarks={bookmarks}
            onPageChange={handlePageChange}
            onSentenceClick={handleSentenceClick}
            onToggleBookmark={handleToggleBookmark}
            onThemeChange={setTheme}
            onFontChange={setFont}
            onFontSizeChange={(delta) => setFontSize((prev) => Math.max(14, Math.min(28, prev + delta)))}
          />
        )}

        {activeTab === 'library' && (
          <LibraryModal
            books={books}
            activeBookId={currentBookId}
            onSelectBook={(selected) => {
              speechEngine.stop();
              setCurrentBookId(selected.id);
              setCurrentPage(1);
              setCurrentSentenceIdx(0);
              setActiveTab('reader');
            }}
            onDeleteBook={handleDeleteBook}
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksModal
            bookmarks={bookmarks}
            books={books}
            onSelectBookmark={handleSelectBookmark}
            onDeleteBookmark={handleDeleteBookmark}
          />
        )}
      </div>

      {/* Fixed Bottom Player Bar */}
      <PlayerBar
        book={currentBook}
        currentPage={currentPage}
        currentSentenceIdx={currentSentenceIdx}
        totalSentencesOnPage={pageData.sentences.length}
        isPlaying={isPlaying}
        currentAccent={currentAccent}
        playbackRate={playbackRate}
        volume={volume}
        sleepTimerMinutes={sleepTimerMinutes}
        sleepRemainingSeconds={sleepRemainingSeconds}
        onPlay={handlePlay}
        onPause={handlePause}
        onNextSentence={handleNextSentence}
        onPrevSentence={handlePrevSentence}
        onRateChange={handleRateChange}
        onVolumeChange={handleVolumeChange}
        onSetSleepTimer={setSleepTimerMinutes}
        onOpenAccentModal={() => setIsAccentModalOpen(true)}
        onSelectSentence={handleSentenceClick}
      />

      {/* Accent Selector Modal */}
      <AccentModal
        isOpen={isAccentModalOpen}
        onClose={() => setIsAccentModalOpen(false)}
        currentAccent={currentAccent}
        onSelectAccent={handleSelectAccent}
        playbackRate={playbackRate}
        pitch={pitch}
        onRateChange={handleRateChange}
        onPitchChange={handlePitchChange}
      />

      {/* PDF Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onBookLoaded={handleBookLoaded}
        onSelectSample={handleSelectSample}
      />
    </div>
  );
}
