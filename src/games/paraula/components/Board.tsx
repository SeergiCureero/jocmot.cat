import { cn } from '@/lib/cn';
import { evaluateGuess, MAX_GUESSES, WORD_LENGTH, type LetterState } from '../logic';

/** Temps entre el gir d'una fitxa i la següent, i durada total de la revelació d'una fila. */
export const FLIP_STAGGER_MS = 300;
export const REVEAL_MS = FLIP_STAGGER_MS * (WORD_LENGTH - 1) + 500;

const TILE: Record<LetterState, string> = {
  correct: 'bg-correct border-correct text-white',
  present: 'bg-present border-present text-white',
  absent: 'bg-absent border-absent text-white',
};

interface Props {
  guesses: string[];
  current: string;
  answer: string;
  shake: boolean;
  /** Fila que s'acaba d'enviar i s'ha de revelar fitxa a fitxa. */
  revealRow?: number;
  /** Fila guanyadora, que fa un saltet un cop revelada. */
  bounceRow?: number;
}

export default function Board({ guesses, current, answer, shake, revealRow, bounceRow }: Props) {
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length)
      return { letters: guesses[i], states: evaluateGuess(guesses[i], answer) };
    if (i === guesses.length) return { letters: current, states: null, isCurrent: true };
    return { letters: '', states: null };
  });

  return (
    <div className="grid gap-1.5" role="grid" aria-label="Tauler">
      {rows.map((row, r) => (
        <div
          key={r}
          role="row"
          className={cn('grid grid-cols-5 gap-1.5', row.isCurrent && shake && 'animate-shake')}
        >
          {Array.from({ length: WORD_LENGTH }, (_, c) => {
            const letter = row.letters[c] ?? '';
            const state = row.states?.[c];
            const animation =
              r === revealRow
                ? { className: 'animate-reveal', delay: c * FLIP_STAGGER_MS }
                : r === bounceRow
                  ? { className: 'animate-bounce-tile', delay: c * 100 }
                  : null;
            return (
              <div
                key={c}
                role="gridcell"
                style={animation ? { animationDelay: `${animation.delay}ms` } : undefined}
                className={cn(
                  'grid size-14 place-items-center border-2 text-2xl font-bold uppercase sm:size-16',
                  state
                    ? TILE[state]
                    : letter
                      ? 'animate-pop border-stone-500'
                      : 'border-stone-300',
                  animation?.className,
                )}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
