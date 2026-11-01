import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { INPUT } from '@/components/ui/styles';
import { useToast } from '@/components/ui/Toast';
import { SITE } from '@/config/site';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { formatDateCa, puzzleNumberForDate } from '@/lib/date';
import { backend, type DesignableGameId, type PuzzleRecord } from '@/services/backend';

export const TITLE_MAX = 80;

/** Nom del puzle per mostrar-lo a les llistes. */
export function PuzzleName({ puzzle }: { puzzle: Pick<PuzzleRecord, 'title'> }) {
  return puzzle.title ? (
    <span className="font-semibold">{puzzle.title}</span>
  ) : (
    <span className="text-stone-400 italic">Sense nom</span>
  );
}

/** Botó ✏️ per posar o canviar el nom d'un puzle (qualsevol editor, també dels programats). */
export function RenameButton({
  puzzle,
  onSaved,
}: {
  puzzle: PuzzleRecord;
  onSaved: (title: string) => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(puzzle.title);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await backend.updatePuzzleInfo(puzzle.id, { title });
      setOpen(false);
      onSaved(title.trim());
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setTitle(puzzle.title);
          setOpen(true);
        }}
        aria-label={puzzle.title ? 'Canvia el nom' : 'Posa-hi nom'}
        title={puzzle.title ? 'Canvia el nom' : 'Posa-hi nom'}
        className="shrink-0 rounded-full px-2 py-1 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
      >
        ✏️
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nom del puzle">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-3"
        >
          <p>Només el veu el grup d’editors: serveix per reconèixer-lo a les llistes.</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            placeholder="p. ex. Rius i muntanyes"
            aria-label="Nom del puzle"
            autoFocus
            className={INPUT}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel·la
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Desant…' : 'Desa'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

/**
 * Tria del dia preferit (o cap). Avisa si aquell dia ja té un puzle programat del mateix joc:
 * en aprovar-lo, aniria al següent dia lliure.
 */
export function WantedDayInput({
  game,
  value,
  onChange,
}: {
  game: DesignableGameId;
  value: number | null;
  onChange: (number: number | null) => void;
}) {
  const today = getTodayPuzzleNumber();
  const [taken, setTaken] = useState<number[]>([]);
  useEffect(() => {
    backend.listPuzzles().then(
      (list) =>
        setTaken(list.filter((p) => p.game === game && p.number !== null).map((p) => p.number!)),
      () => setTaken([]),
    );
  }, [game]);

  return (
    <div>
      <label className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-stone-700">Dia preferit (opcional)</span>
        <input
          type="date"
          value={value ? getPuzzleDate(value) : ''}
          min={getPuzzleDate(today + 1)}
          onChange={(e) =>
            onChange(e.target.value ? puzzleNumberForDate(e.target.value, SITE.launchDate) : null)
          }
          className={INPUT.replace('w-full', 'w-auto')}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-stone-500 hover:underline"
          >
            Treu-lo
          </button>
        )}
      </label>
      {value !== null && value <= today && (
        <p className="mt-1 text-xs text-red-700">Tria un dia a partir de demà.</p>
      )}
      {value !== null && value > today && taken.includes(value) && (
        <p className="mt-1 text-xs text-amber-800">
          Aquell dia ja hi ha un puzle programat: si no el moveu, sortirà el següent dia lliure.
        </p>
      )}
      {value === null && (
        <p className="mt-1 text-xs text-stone-500">
          Si no en tries cap, sortirà el primer dia lliure quan l’aprovin.
        </p>
      )}
    </div>
  );
}

/** "vol sortir el 5 de novembre de 2026" */
export const wantedText = (number: number) =>
  `vol sortir el ${formatDateCa(getPuzzleDate(number))}`;
