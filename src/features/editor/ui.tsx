import type { ReactNode } from 'react';
import { getPuzzleDate } from '@/games/puzzles';
import { GAMES } from '@/games/registry';
import { formatDateCa } from '@/lib/date';
import type { DesignableGameId, PuzzleRecord } from '@/services/backend';
import { APPROVALS_NEEDED, validApprovals } from './schedule';
import Icon from '@/components/ui/Icon';

export const gameMeta = (id: DesignableGameId) => GAMES.find((g) => g.id === id)!;

export function GameLabel({ game }: { game: DesignableGameId }) {
  const meta = gameMeta(game);
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <span className={`grid size-7 place-items-center rounded-lg text-sm ${meta.theme.bg}`}>
        <Icon name={meta.icon} />
      </span>
      {meta.name}
    </span>
  );
}

export function statusText(p: PuzzleRecord): string {
  if (p.status === 'proposed')
    return `En revisió · ${validApprovals(p).length}/${APPROVALS_NEEDED} aprovacions`;
  const date = formatDateCa(getPuzzleDate(p.number!));
  return new Date(p.releaseAt!) > new Date()
    ? `Programat per al ${date} (#${p.number})`
    : `Publicat el ${date} (#${p.number})`;
}

export function ErrorList({ errors }: { errors: string[] }) {
  if (!errors.length) {
    return (
      <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
        ✓ Tot correcte: ja el pots provar.
      </p>
    );
  }
  return (
    <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <p className="font-semibold">Encara hi falta:</p>
      <ul className="list-disc pl-5">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

export function Section({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode[];
  empty: string;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children.length ? (
        <ul className="space-y-2">{children}</ul>
      ) : (
        <p className="text-sm text-stone-500">{empty}</p>
      )}
    </section>
  );
}

export const ROW =
  'flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 transition hover:shadow-md';
