import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { INPUT } from '@/components/ui/styles';
import { useToast } from '@/components/ui/Toast';
import { SITE } from '@/config/site';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { formatDateCa, puzzleNumberForDate } from '@/lib/date';
import { backend, type PuzzleRecord } from '@/services/backend';

/** Botó "Canvia el dia" d'un puzle programat. Si el dia triat ja té un puzle del mateix joc, s'intercanvien. */
export default function MoveDay({
  puzzle,
  onMoved,
}: {
  puzzle: PuzzleRecord;
  onMoved: () => void;
}) {
  const toast = useToast();
  const today = getTodayPuzzleNumber();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(getPuzzleDate(puzzle.number!));
  const [busy, setBusy] = useState(false);
  // Tots els puzles, per avisar si el dia triat ja està ocupat (es carreguen en obrir).
  const [puzzles, setPuzzles] = useState<PuzzleRecord[]>([]);

  if (puzzle.status !== 'published' || !puzzle.number || puzzle.number <= today) return null;

  const number = date ? puzzleNumberForDate(date, SITE.launchDate) : 0;
  const valid = number > today;
  const other = puzzles.find(
    (p) => p.game === puzzle.game && p.number === number && p.id !== puzzle.id,
  );

  function openDialog() {
    setOpen(true);
    backend.listPuzzles().then(setPuzzles, () => setPuzzles([]));
  }

  async function move() {
    setBusy(true);
    try {
      await backend.call(`/puzles/${puzzle.id}/dia`, { method: 'POST', body: { number } });
      setOpen(false);
      toast(other ? 'Intercanviats!' : `Mogut al ${formatDateCa(date)}`);
      onMoved();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" className="shrink-0 px-3 py-1 text-xs" onClick={openDialog}>
        Canvia el dia
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Canvia el dia">
        <p>
          Ara surt el <strong>{formatDateCa(getPuzzleDate(puzzle.number))}</strong> (#
          {puzzle.number}). Tria el dia nou:
        </p>
        <input
          type="date"
          value={date}
          min={getPuzzleDate(today + 1)}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Dia nou"
          className={INPUT}
        />
        {!valid && <p className="text-red-700">Tria un dia a partir de demà.</p>}
        {valid && other && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
            Aquest dia ja té un puzle de {other.author.username}: passarà al{' '}
            {formatDateCa(getPuzzleDate(puzzle.number))}.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel·la
          </Button>
          <Button disabled={!valid || number === puzzle.number || busy} onClick={move}>
            {busy ? 'Movent…' : other ? 'Intercanvia’ls' : 'Mou-lo'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
