import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { backend } from '@/services/backend';
import { drafts } from './drafts';
import { KITS } from './kits';
import PreviewPlayer from './PreviewPlayer';
import { ErrorList, GameLabel } from './ui';
import Icon from '@/components/ui/Icon';

/** Esborrany local: s'edita, es prova i es proposa al grup. */
export default function DraftPage() {
  const { id = '' } = useParams();
  const draft = drafts.get(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(draft?.data);
  const [playing, setPlaying] = useState(false);
  const [sending, setSending] = useState(false);

  if (!draft) return <Navigate to="/editor" replace />;
  const kit = KITS[draft.game];
  const { puzzle, errors } = kit.build(data);

  const change = (next: unknown) => {
    setData(next);
    drafts.save(id, next);
  };

  async function propose() {
    setSending(true);
    try {
      const record = await backend.proposePuzzle(draft!.game, puzzle);
      drafts.remove(id);
      toast('Proposat! Ara el grup el pot revisar.');
      navigate(`/editor/puzle/${record.id}`, { replace: true });
    } catch (e) {
      toast(e instanceof Error ? e.message : 'No s’ha pogut proposar');
      setSending(false);
    }
  }

  const remove = () => {
    if (!confirm('Vols eliminar aquest esborrany?')) return;
    drafts.remove(id);
    navigate('/editor');
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/editor" className="text-brand-700 text-sm hover:underline">
        <Icon name="fletxa-esquerra" /> Editor
      </Link>
      <div className="mt-2 mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          <GameLabel game={draft.game} />{' '}
          <span className="text-base font-medium text-stone-500">· esborrany</span>
        </h1>
        <Button variant="ghost" onClick={remove}>
          Elimina
        </Button>
      </div>

      {playing ? (
        <>
          <Button variant="secondary" onClick={() => setPlaying(false)}>
            <Icon name="fletxa-esquerra" /> Torna a l’editor
          </Button>
          <PreviewPlayer game={draft.game} puzzle={puzzle} />
        </>
      ) : (
        <>
          <kit.Form value={data} onChange={change} />
          <div className="sticky bottom-0 mt-6 space-y-3 border-t border-stone-200 bg-stone-50/95 py-4 backdrop-blur">
            <ErrorList errors={errors} />
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" disabled={!puzzle} onClick={() => setPlaying(true)}>
                Prova’l
              </Button>
              <Button disabled={!puzzle || sending} onClick={propose}>
                {sending ? 'Enviant…' : 'Proposa’l al grup'}
              </Button>
            </div>
            <p className="text-xs text-stone-500">Es desa sol en aquest navegador.</p>
          </div>
        </>
      )}
    </div>
  );
}
