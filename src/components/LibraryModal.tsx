import { useState } from 'react';
import { Book as BookType } from '../types';
import { BookOpen, Upload, Trash2, Clock, FileText, Search, Sparkles } from 'lucide-react';

interface LibraryModalProps {
  books: BookType[];
  activeBookId: string;
  onSelectBook: (book: BookType) => void;
  onDeleteBook: (bookId: string) => void;
  onOpenUpload: () => void;
}

export function LibraryModal({
  books,
  activeBookId,
  onSelectBook,
  onDeleteBook,
  onOpenUpload,
}: LibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 pb-36">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400">
            Tu Colección Sonora
          </span>
          <h1 className="text-3xl font-editorial font-semibold text-stone-900 dark:text-stone-100 mt-1">
            Biblioteca de Lectura
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Selecciona un libro para reanudar la narración con tu acento favorito o sube nuevos documentos en PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar libro o autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir PDF</span>
          </button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => {
          const isActive = book.id === activeBookId;

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className={`group relative rounded-2xl border bg-white dark:bg-stone-900/80 p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md ${
                isActive
                  ? 'border-amber-500 ring-2 ring-amber-500/30'
                  : 'border-stone-200 dark:border-stone-800 hover:border-amber-400/60 dark:hover:border-amber-500/50'
              }`}
            >
              <div>
                <div className="flex gap-4">
                  {/* Book Cover Image */}
                  <div className="w-20 h-28 shrink-0 overflow-hidden rounded-lg shadow-sm bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 relative">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-stone-100 dark:bg-stone-800 text-stone-500">
                        <FileText className="w-6 h-6 text-amber-500 mb-1" />
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">PDF</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                      {book.source === 'sample' ? (
                        <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Clásico
                        </span>
                      ) : (
                        <span className="text-blue-700 dark:text-blue-400 font-medium">Subido por oyente</span>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{book.totalPages} págs.</span>
                    </div>

                    <h3 className="text-base font-editorial font-bold text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                      {book.author}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{book.estimatedMinutes} min
                      </span>
                      <span>{book.totalWords.toLocaleString()} palabras</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-4 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Bottom Action Row */}
              <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold flex items-center gap-1.5 ${
                    isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {isActive ? 'Lectura en curso' : 'Abrir y Escuchar'}
                </span>

                {book.source === 'upload' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Deseas eliminar "${book.title}" de tu biblioteca?`)) {
                        onDeleteBook(book.id);
                      }
                    }}
                    className="p-1 text-stone-400 hover:text-red-500 transition-colors rounded"
                    title="Eliminar de la biblioteca"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
