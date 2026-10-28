import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/cn';
import { backend, type PuzzleRecord } from '@/services/backend';
import { KITS } from './kits';
import PreviewPlayer from './PreviewPlayer';
import { APPROVALS_NEEDED, publishIfReady, validApprovals } from './schedule';
import { ErrorList, GameLabel, statusText } from './ui';
import { INPUT } from './kits/types';
import Icon from '@/components/ui/Icon';

/** Un puzle proposat o publicat: jugar-hi, veure la solució, revisar-lo i (si és teu) editar-lo. */
export default function PuzzlePage() {
  const { id = '' } = useParams();
  const [record, setRecord] = useState<PuzzleRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () => backend.getPuzzle(id).then(setRecord, (e: Error) => setError(e.message)),
    [id],
  );
  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="py-8 text-center text-red-700">{error}</p>;
  if (!record) return <Spinner />;
  return (
    <PuzzleView key={record.updated + record.reviews.length} record={record} onChange={setRecord} />
  );
}

function PuzzleView({
  record,
  onChange,
}: {
  record: PuzzleRecord;
  onChange: (r: PuzzleRecord) => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const kit = KITS[record.game];
  const mine = record.author.id === user!.id;
  const editable = mine && record.status === 'proposed';
  const myReview = record.reviews.find((r) => r.author.id === user!.id);
  // Una aprovació anterior a l'últim canvi ja no compta: cal tornar a aprovar.
  const approvedByMe = Boolean(myReview && validApprovals(record).includes(myReview));

  const [playing, setPlaying] = useState(false);
  // Qui revisa, millor que hi jugui abans de veure la solució.
  const [showSolution, setShowSolution] = useState(mine || record.status === 'published');
  const [draft, setDraft] = useState(() => kit.fromPuzzle(record.data));
  const [dirty, setDirty] = useState(false);
  const [comment, setComment] = useState(myReview?.comment ?? '');
  const [busy, setBusy] = useState(false);
  const built = kit.build(draft);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Hi ha hagut un error');
    } finally {
      setBusy(false);
    }
  }

  const saveChanges = () =>
    run(async () => {
      await backend.updatePuzzle(record.id, built.puzzle);
      onChange(await backend.getPuzzle(record.id));
      toast('Desat');
    });

  const review = (approved: boolean) =>
    run(async () => {
      await backend.saveReview(record.id, { approved, comment: comment.trim() });
      const updated = await publishIfReady(record.id);
      if (updated.status === 'published')
        toast(`Aprovat i programat! ${statusText(updated)}`, 4000);
      else toast(approved ? 'Aprovat' : 'Desat');
      onChange(updated);
    });

  const remove = () => {
    if (!confirm('Vols retirar aquesta proposta? S’esborraran també les revisions.')) return;
    run(async () => {
      await backend.deletePuzzle(record.id);
      navigate('/editor');
    });
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/editor" className="text-brand-700 text-sm hover:underline">
        <Icon name="fletxa-esquerra" /> Editor
      </Link>
      <div className="mt-2 mb-1 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          <GameLabel game={record.game} />
        </h1>
        {editable && (
          <Button variant="ghost" onClick={remove} disabled={busy}>
            Retira-la
          </Button>
        )}
      </div>
      <p className="mb-6 text-sm text-stone-600">
        De {mine ? 'tu' : record.author.username} · {statusText(record)}
      </p>

      {playing ? (
        <>
          <Button variant="secondary" onClick={() => setPlaying(false)}>
            <Icon name="fletxa-esquerra" /> Torna
          </Button>
          <PreviewPlayer game={record.game} puzzle={editable ? built.puzzle : record.data} />
        </>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setPlaying(true)}
              disabled={editable && !built.puzzle}
            >
              Juga-hi
            </Button>
            {!showSolution && (
              <Button variant="ghost" onClick={() => setShowSolution(true)}>
                Mostra la solució
              </Button>
            )}
          </div>

          {showSolution && (
            <div className="mb-8">
              <kit.Form
                value={draft}
                readOnly={!editable}
                onChange={(next) => {
                  setDraft(next);
                  setDirty(true);
                }}
              />
              {editable && dirty && (
                <div className="sticky bottom-0 mt-4 space-y-3 border-t border-stone-200 bg-stone-50/95 py-4 backdrop-blur">
                  <ErrorList errors={built.errors} />
                  {record.reviews.some((r) => r.approved) && (
                    <p className="text-sm text-amber-800">
                      Si el canvies, les aprovacions que ja té s’hauran de repetir.
                    </p>
                  )}
                  <Button disabled={!built.puzzle || busy} onClick={saveChanges}>
                    Desa els canvis
                  </Button>
                </div>
              )}
            </div>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Revisions{' '}
              <span className="text-sm font-normal text-stone-500">
                ({validApprovals(record).length}/{APPROVALS_NEEDED} aprovacions)
              </span>
            </h2>
            <ul className="mb-6 space-y-2">
              {record.reviews.length === 0 && (
                <li className="text-sm text-stone-500">Encara no l’ha revisat ningú.</li>
              )}
              {record.reviews.map((r) => {
                const stale = r.approved && !validApprovals(record).includes(r);
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-stone-200 bg-white p-3 text-sm"
                  >
                    <p className="font-semibold">
                      {r.author.id === user!.id ? 'Tu' : r.author.username}{' '}
                      {r.approved && (
                        <span
                          className={cn(
                            'ml-1 font-normal',
                            stale ? 'text-stone-400 line-through' : 'text-correct',
                          )}
                        >
                          <Icon name="fet" /> aprovat
                        </span>
                      )}
                      {stale && (
                        <span className="ml-1 font-normal text-stone-500">
                          (abans de l’últim canvi)
                        </span>
                      )}
                    </p>
                    {r.comment && (
                      <p className="mt-1 whitespace-pre-line text-stone-700">{r.comment}</p>
                    )}
                  </li>
                );
              })}
            </ul>

            {record.status === 'proposed' && (
              <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-stone-700">
                    {mine ? 'Respon als comentaris' : 'El teu comentari (opcional)'}
                  </span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder={mine ? '' : 'Què t’ha semblat? Hi ha alguna paraula dubtosa?'}
                    className={INPUT}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {!mine && !approvedByMe && (
                    <Button disabled={busy} onClick={() => review(true)}>
                      Aprova’l
                    </Button>
                  )}
                  {!mine && approvedByMe && (
                    <Button variant="secondary" disabled={busy} onClick={() => review(false)}>
                      Retira l’aprovació
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    disabled={busy || !comment.trim()}
                    onClick={() => review(approvedByMe)}
                  >
                    Desa el comentari
                  </Button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
