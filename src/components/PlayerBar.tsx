import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Moon,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { Book, AccentVoiceProfile } from '../types';

interface PlayerBarProps {
  book: Book;
  currentPage: number;
  currentSentenceIdx: number;
  totalSentencesOnPage: number;
  isPlaying: boolean;
  currentAccent: AccentVoiceProfile;
  playbackRate: number;
  volume: number;
  sleepTimerMinutes: number | null;
  sleepRemainingSeconds: number | null;
  onPlay: () => void;
  onPause: () => void;
  onNextSentence: () => void;
  onPrevSentence: () => void;
  onRateChange: (rate: number) => void;
  onVolumeChange: (volume: number) => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onOpenAccentModal: () => void;
  onSelectSentence: (sentenceIdx: number) => void;
}

export function PlayerBar({
  book,
  currentPage,
  currentSentenceIdx,
  totalSentencesOnPage,
  isPlaying,
  currentAccent,
  playbackRate,
  volume,
  sleepTimerMinutes,
  sleepRemainingSeconds,
  onPlay,
  onPause,
  onNextSentence,
  onPrevSentence,
  onRateChange,
  onVolumeChange,
  onSetSleepTimer,
  onOpenAccentModal,
  onSelectSentence,
}: PlayerBarProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const speedMenuRef = useRef<HTMLDivElement>(null);
  const sleepMenuRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false);
      }
      if (sleepMenuRef.current && !sleepMenuRef.current.contains(event.target as Node)) {
        setShowSleepMenu(false);
      }
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = totalSentencesOnPage > 0
    ? Math.min(100, Math.round(((currentSentenceIdx + 1) / totalSentencesOnPage) * 100))
    : 0;

  const totalBookProgress = Math.round(((currentPage - 1) / Math.max(1, book.totalPages)) * 100);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 text-stone-100 shadow-2xl">
      {/* Visual progress scrubber for current page */}
      <div
        className="w-full h-1 bg-stone-800 cursor-pointer group relative"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          const targetSentence = Math.floor(ratio * totalSentencesOnPage);
          onSelectSentence(targetSentence);
        }}
        title="Progreso de oraciones en la página actual"
      >
        <div
          className="h-full bg-amber-400 group-hover:bg-amber-300 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Book & Accent Info */}
        <div className="flex items-center gap-3 min-w-0 max-w-[32%]">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              referrerPolicy="no-referrer"
              className="w-10 h-14 object-cover rounded shadow-md shrink-0 border border-stone-800 hidden sm:block"
            />
          ) : (
            <div className="w-10 h-14 bg-stone-800 rounded flex items-center justify-center text-amber-400/80 shrink-0 hidden sm:flex border border-stone-700">
              <span className="font-editorial text-xs font-bold">PDF</span>
            </div>
          )}

          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-stone-100 truncate">
              {book.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5 truncate">
              <span>{book.author}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Pág. {currentPage} de {book.totalPages}</span>
            </div>
            
            {/* Quick Accent Selector Pill */}
            <button
              onClick={onOpenAccentModal}
              className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors truncate max-w-full"
              title="Cambiar acento de voz"
            >
              <span>{currentAccent.flag}</span>
              <span className="truncate">{currentAccent.name}</span>
              <SlidersHorizontal className="w-2.5 h-2.5 shrink-0 opacity-70" />
            </button>
          </div>
        </div>

        {/* Center: Main Playback Controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Previous Sentence */}
            <button
              onClick={onPrevSentence}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-full transition-colors"
              title="Oración anterior"
            >
              <SkipBack className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Rewind 1-sentence quick button */}
            <button
              onClick={onPrevSentence}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-full transition-colors hidden sm:block"
              title="Rebobinar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pausar (Espacio)' : 'Escuchar (Espacio)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Sentence */}
            <button
              onClick={onNextSentence}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-full transition-colors"
              title="Oración siguiente"
            >
              <SkipForward className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>

          {/* Sentence Counter Text */}
          <div className="text-[10px] text-stone-400 font-mono tabular-nums">
            Oración {currentSentenceIdx + 1} de {totalSentencesOnPage} ({totalBookProgress}% del libro)
          </div>
        </div>

        {/* Right: Audio Adjustments (Speed, Sleep Timer, Volume) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Speed Selector */}
          <div className="relative" ref={speedMenuRef}>
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-stone-300 hover:text-stone-100 bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 transition-colors"
              title="Velocidad de reproducción"
            >
              <Gauge className="w-3.5 h-3.5 text-stone-400" />
              <span className="tabular-nums">{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-32 bg-stone-900 border border-stone-800 rounded-xl shadow-xl py-1 z-50">
                {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      onRateChange(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left font-mono tabular-nums flex items-center justify-between hover:bg-stone-800 ${
                      playbackRate === rate ? 'text-amber-400 font-semibold bg-stone-800/40' : 'text-stone-300'
                    }`}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <span className="text-[10px] uppercase">Actual</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep Timer */}
          <div className="relative" ref={sleepMenuRef}>
            <button
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              className={`flex items-center gap-1 p-2 rounded-lg text-xs transition-colors ${
                sleepTimerMinutes !== null
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              }`}
              title="Temporizador de apagado"
            >
              <Moon className="w-4 h-4" />
              {sleepRemainingSeconds !== null && (
                <span className="text-[10px] font-mono tabular-nums">
                  {formatTimer(sleepRemainingSeconds)}
                </span>
              )}
            </button>

            {showSleepMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-44 bg-stone-900 border border-stone-800 rounded-xl shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-stone-400 border-b border-stone-800 font-semibold">
                  Temporizador
                </div>
                {[5, 15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      onSetSleepTimer(mins);
                      setShowSleepMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left hover:bg-stone-800 flex items-center justify-between ${
                      sleepTimerMinutes === mins ? 'text-amber-400 font-semibold' : 'text-stone-300'
                    }`}
                  >
                    <span>{mins} minutos</span>
                    {sleepTimerMinutes === mins && <span className="text-[10px]">Activo</span>}
                  </button>
                ))}
                {sleepTimerMinutes !== null && (
                  <button
                    onClick={() => {
                      onSetSleepTimer(null);
                      setShowSleepMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-stone-800 border-t border-stone-800 mt-1"
                  >
                    Desactivar temporizador
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="relative hidden sm:block" ref={volumeRef}>
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
              title="Volumen"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {showVolumeSlider && (
              <div className="absolute right-0 bottom-full mb-2 p-3 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-50 flex items-center gap-2 w-36">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-stone-400 tabular-nums">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
