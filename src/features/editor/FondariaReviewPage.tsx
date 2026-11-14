import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { backend } from '@/services/backend';

interface Suggestion {
  id: string;
  category: string;
  categoryName: string;
  text: string;
  count: number;
}

/** Respostes que els jugadors de Fondària han proposat i que no són a les llistes: aprovar-les o rebutjar-les. */
export default function FondariaReviewPage() {
  const toast = useToast();
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      backend.call<{ suggestions: Suggestion[] }>('/admin/fondaria/suggeriments').then(
        (d) => setItems(d.suggestions),
        (e: Error) => setError(e.message),
      ),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);

  async function decide(item: Suggestion, action: 'approve' | 'reject') {
    try {
      await backend.call(`/admin/fondaria/suggeriments/${item.id}`, {
        method: 'POST',
        body: { action },
      });
      setItems((list) => (list ?? []).filter((i) => i.id !== item.id));
      toast(action === 'approve' ? `«${item.text}» aprovada` : `«${item.text}» rebutjada`);
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/editor" className="text-brand-700 text-sm hover:underline">
        ← Editor
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Fondària: respostes noves</h1>
      <p className="mt-1 mb-5 text-sm text-stone-600">
        Coses que els jugadors han escrit i que no són a les llistes. Si les aprovis, ja compten
        (com a respostes poc habituals); si les rebutges, no tornen a sortir aquí.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
          No hi ha res per revisar. 🌊
        </p>
      )}
      {items && items.length > 0 && (
        <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{i.text}</span>
                <span className="block text-xs text-stone-500">
                  {i.categoryName} · {i.count} {i.count === 1 ? 'jugador' : 'jugadors'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => decide(i, 'reject')}
                className="min-h-11 rounded-full border border-stone-300 px-4 text-sm font-semibold hover:bg-stone-100"
              >
                Rebutja
              </button>
              <button
                type="button"
                onClick={() => decide(i, 'approve')}
                className="bg-brand-700 hover:bg-brand-900 min-h-11 rounded-full px-4 text-sm font-semibold text-white"
              >
                Aprova
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
