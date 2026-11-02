import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, Sparkles } from 'lucide-react';
import { Book } from '../types';
import { extractBookFromPdf, ExtractionProgress } from '../utils/pdfExtractor';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookLoaded: (book: Book) => void;
  onSelectSample: (sampleId: string) => void;
}

export function UploadModal({
  isOpen,
  onClose,
  onBookLoaded,
  onSelectSample,
}: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Por favor selecciona un archivo en formato PDF.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('El archivo es demasiado grande (máximo recomendado 50MB).');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setProgress({ currentPage: 0, totalPages: 0, status: 'Iniciando lectura del documento...' });

      const newBook = await extractBookFromPdf(file, (p) => {
        setProgress(p);
      });

      setIsProcessing(false);
      onBookLoaded(newBook);
      onClose();
    } catch (err: unknown) {
      console.error('PDF extraction failed:', err);
      setIsProcessing(false);
      setErrorMsg(
        err instanceof Error
          ? `Error al procesar el PDF: ${err.message}`
          : 'No se pudo leer el documento. Asegúrate de que no esté protegido con contraseña.'
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-editorial font-semibold text-stone-100">
                Subir Libro en PDF
              </h2>
              <p className="text-xs text-stone-400">
                El texto se procesa en tu navegador para una lectura privada y veloz
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-400 bg-amber-950/20'
                : 'border-stone-700 hover:border-amber-500/60 bg-stone-950/50 hover:bg-stone-950'
            } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="w-9 h-9 text-amber-400 animate-spin mb-3" />
                <span className="text-sm font-medium text-stone-200">
                  {progress?.status || 'Extrayendo páginas y estructura del PDF...'}
                </span>
                {progress && progress.totalPages > 0 && (
                  <div className="w-full max-w-xs mt-3">
                    <div className="flex justify-between text-xs text-stone-400 mb-1">
                      <span>Páginas</span>
                      <span className="font-mono tabular-nums">
                        {progress.currentPage} / {progress.totalPages}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-150"
                        style={{
                          width: `${(progress.currentPage / progress.totalPages) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-stone-200 mb-1">
                  Haz clic para examinar o arrastra tu PDF aquí
                </h3>
                <p className="text-xs text-stone-400 max-w-xs">
                  Soporta libros, artículos, manuales y ensayos en PDF con texto extraíble.
                </p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Start with Sample Classics */}
          <div className="pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ¿No tienes un PDF a mano? Prueba un clásico
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectSample('quijote-cervantes');
                  onClose();
                }}
                className="p-2.5 rounded-lg border border-stone-800 bg-stone-950/70 hover:border-amber-500/60 hover:bg-stone-800/80 transition-colors text-left"
              >
                <div className="text-xs font-medium text-stone-200 truncate">Don Quijote</div>
                <div className="text-[10px] text-stone-400 truncate">M. de Cervantes</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectSample('principito-exupery');
                  onClose();
                }}
                className="p-2.5 rounded-lg border border-stone-800 bg-stone-950/70 hover:border-amber-500/60 hover:bg-stone-800/80 transition-colors text-left"
              >
                <div className="text-xs font-medium text-stone-200 truncate">El Principito</div>
                <div className="text-[10px] text-stone-400 truncate">A. Saint-Exupéry</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectSample('macondo-marquez');
                  onClose();
                }}
                className="p-2.5 rounded-lg border border-stone-800 bg-stone-950/70 hover:border-amber-500/60 hover:bg-stone-800/80 transition-colors text-left"
              >
                <div className="text-xs font-medium text-stone-200 truncate">Macondo</div>
                <div className="text-[10px] text-stone-400 truncate">G. García Márquez</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Extracción local 100% privada sin subir a servidores</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
