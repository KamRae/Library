import { useState } from 'react';
import { X, Volume2, Check, RotateCcw, Sparkles } from 'lucide-react';
import { AccentVoiceProfile } from '../types';
import { ACCENT_PROFILES } from '../data/accentProfiles';
import { speechEngine } from '../services/speechEngine';

interface AccentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccent: AccentVoiceProfile;
  onSelectAccent: (accent: AccentVoiceProfile) => void;
  playbackRate: number;
  pitch: number;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
}

export function AccentModal({
  isOpen,
  onClose,
  currentAccent,
  onSelectAccent,
  playbackRate,
  pitch,
  onRateChange,
  onPitchChange,
}: AccentModalProps) {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<'hispano' | 'international'>('hispano');

  if (!isOpen) return null;

  const handleTestVoice = (profile: AccentVoiceProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestingId(profile.id);
    speechEngine.previewAccent(profile, () => {
      setTestingId(null);
    });
  };

  const filteredProfiles = ACCENT_PROFILES.filter((p) => p.regionGroup === activeGroup);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/90">
          <div>
            <h2 className="text-xl font-editorial font-semibold text-stone-100">
              Seleccionar Acento del Lector
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Personaliza la entonación, modulación regional y cadencia de la voz narrativa
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Region category tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-stone-800/60 bg-stone-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-lg border border-stone-800">
            <button
              onClick={() => setActiveGroup('hispano')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeGroup === 'hispano'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Hispanoamérica y España ({ACCENT_PROFILES.filter((p) => p.regionGroup === 'hispano').length})
            </button>
            <button
              onClick={() => setActiveGroup('international')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeGroup === 'international'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Internacional ({ACCENT_PROFILES.filter((p) => p.regionGroup === 'international').length})
            </button>
          </div>

          <span className="hidden sm:inline text-xs text-stone-500">
            Acento activo: <strong className="text-amber-400 font-medium">{currentAccent.name}</strong>
          </span>
        </div>

        {/* Voice Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProfiles.map((profile) => {
              const isSelected = currentAccent.id === profile.id;
              const isTesting = testingId === profile.id;

              return (
                <div
                  key={profile.id}
                  onClick={() => onSelectAccent(profile)}
                  className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/20 shadow-md ring-1 ring-amber-500/40'
                      : 'border-stone-800 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-950'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl leading-none">{profile.flag}</span>
                        <div>
                          <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                            {profile.name}
                            {isSelected && (
                              <Check className="w-4 h-4 text-amber-400 shrink-0 inline" />
                            )}
                          </h3>
                          <span className="text-xs text-stone-400">{profile.country}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleTestVoice(profile, e)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors shrink-0 ${
                          isTesting
                            ? 'bg-amber-500 text-stone-950 animate-pulse'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                        }`}
                        title="Escuchar muestra del acento"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isTesting ? 'Sonando...' : 'Probar'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-2.5">
                      {profile.culturalNote}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800/70 text-xs italic text-stone-400/90 line-clamp-1">
                    {profile.samplePhrase}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voice Tuning Sliders */}
          <div className="mt-5 p-4 rounded-xl border border-stone-800 bg-stone-950/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Afinación Fina de la Lectura
              </span>
              <button
                onClick={() => {
                  onRateChange(1.0);
                  onPitchChange(1.0);
                }}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-stone-300 mb-1.5">
                  <span>Velocidad de Lectura</span>
                  <span className="font-mono tabular-nums text-amber-400">{playbackRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.0"
                  step="0.05"
                  value={playbackRate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                  <span>Pausado (0.6x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Rápido (2.0x)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-stone-300 mb-1.5">
                  <span>Tono / Modulación Vocal</span>
                  <span className="font-mono tabular-nums text-amber-400">{pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 mt-0.5">
                  <span>Grave</span>
                  <span>Natural</span>
                  <span>Agudo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-900 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Los acentos utilizan los motores de voz del sistema con modulación de frecuencia fonética.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            Aplicar y Volver
          </button>
        </div>
      </div>
    </div>
  );
}
