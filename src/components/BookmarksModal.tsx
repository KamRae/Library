import { Bookmark as BookmarkType, Book } from '../types';
import { Bookmark, Play, Trash2, ArrowRight } from 'lucide-react';

interface BookmarksModalProps {
  bookmarks: BookmarkType[];
  books: Book[];
  onSelectBookmark: (bookmark: BookmarkType) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
}

export function BookmarksModal({
  bookmarks,
  books,
  onSelectBookmark,
  onDeleteBookmark,
}: BookmarksModalProps) {
  const getBookTitle = (bookId: string) => {
    return books.find((b) => b.id === bookId)?.title || 'Libro';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 pb-36">
      <div className="pb-6 border-b border-stone-200 dark:border-stone-800 mb-8">
        <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400">
          Tus Citas y Pasajes Guardados
        </span>
        <h1 className="text-3xl font-editorial font-semibold text-stone-900 dark:text-stone-100 mt-1">
          Marcadores de Lectura
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Haz clic en cualquier fragmento para reanudar la narración exactamente desde esa línea.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-300 dark:border-stone-800 rounded-2xl bg-white/40 dark:bg-stone-900/40">
          <Bookmark className="w-10 h-10 text-stone-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-medium text-stone-800 dark:text-stone-200">
            Aún no has guardado ningún marcador
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1">
            Mientras escuchas o lees, pasa el cursor sobre cualquier oración y haz clic en el icono de marcador para guardarla aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              onClick={() => onSelectBookmark(bookmark)}
              className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-xs hover:shadow-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    {getBookTitle(bookmark.bookId)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">Página {bookmark.page}</span>
                  <span aria-hidden="true">·</span>
                  <span>{bookmark.createdAt}</span>
                </div>

                <blockquote className="font-reading text-sm sm:text-base text-stone-800 dark:text-stone-200 italic line-clamp-3 border-l-2 border-amber-400 pl-3 py-0.5">
                  «{bookmark.snippet}»
                </blockquote>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBookmark(bookmark);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Escuchar</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBookmark(bookmark.id);
                  }}
                  className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="Eliminar marcador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
