import { useCallback, useEffect, useMemo, useState } from 'react';
import GameShell from '@/components/game/GameShell';
import Keyboard, { BACKSPACE, ENTER } from '@/components/game/Keyboard';
import { useToast } from '@/components/ui/Toast';
import { SITE } from '@/config/site';
import { useGameProgress } from '@/features/progress/useGameProgress';
import { prefersReducedMotion } from '@/lib/dom';
import { normalizeWord } from '@/lib/text';
import { pickByNumber } from '../puzzles';
import type { GameProps } from '../types';
import Board, { REVEAL_MS } from './components/Board';
import { ANSWERS } from './data/answers';
import { EXTRA_VALID, STRICT_DICTIONARY } from './data/dictionary';
import {
  buildShareText,
  getStatus,
  initialState,
  keyboardStates,
  MAX_GUESSES,
  submitGuess,
  WORD_LENGTH,
} from './logic';
import { meta } from './meta';

const DICTIONARY = new Set([...ANSWERS, ...EXTRA_VALID].map(normalizeWord));
const isValidWord = (w: string) => !STRICT_DICTIONARY || DICTIONARY.has(w);

const PRAISE = ['Genial!', 'Magnífic!', 'Impressionant!', 'Molt bé!', 'Bé!', 'Pel pèl!'];

const KEY_COLORS = {
  correct: 'bg-correct text-white',
  present: 'bg-present text-white',
  absent: 'bg-absent text-white',
};

export default function ParaulaGame({ puzzleNumber, date }: GameProps) {
  const answer = pickByNumber(ANSWERS, puzzleNumber);
  const { state, update, status } = useGameProgress({
    gameId: meta.id,
    puzzleId: puzzleNumber,
    initialState,
    getStatus,
  });
  const [current, setCurrent] = useState('');
  const [shake, setShake] = useState(false);
  // Mentre es revela una fila no s'accepten tecles, i el teclat i el resultat esperen al final.
  const [revealing, setRevealing] = useState(false);
  // La partida s'ha acabat en aquesta visita? (per celebrar-ho només llavors)
  const [justFinished, setJustFinished] = useState(false);
  const toast = useToast();

  const keyStates = useMemo(
    () => keyboardStates(revealing ? state.guesses.slice(0, -1) : state.guesses, answer),
    [revealing, state.guesses, answer],
  );

  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(
      () => {
        setRevealing(false);
        if (status === 'won') toast(PRAISE[state.guesses.length - 1]);
      },
      prefersReducedMotion() ? 0 : REVEAL_MS,
    );
    return () => clearTimeout(id);
  }, [revealing, status, state.guesses.length, toast]);

  const onKey = useCallback(
    (key: string) => {
      if (status !== 'playing' || revealing) return;
      if (key === BACKSPACE) return setCurrent((c) => c.slice(0, -1));
      if (key !== ENTER) return setCurrent((c) => (c.length < WORD_LENGTH ? c + key : c));

      const result = submitGuess(state, current, answer, isValidWord);
      if ('error' in result) {
        toast(result.error === 'too-short' ? 'Falten lletres' : 'No és al diccionari');
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      update(() => result.state);
      setCurrent('');
      setRevealing(true);
      setJustFinished(getStatus(result.state) !== 'playing');
    },
    [status, revealing, state, current, answer, update, toast],
  );

  const shareUrl = `${SITE.url}/${meta.slug}`;
  const result =
    status === 'playing' || revealing
      ? null
      : {
          title:
            status === 'won'
              ? `Molt bé! ${state.guesses.length}/${MAX_GUESSES}`
              : 'Una altra vegada serà',
          body: (
            <>
              La paraula era <strong className="uppercase">{answer}</strong>.
            </>
          ),
          shareText: buildShareText(puzzleNumber, state, answer, shareUrl),
          won: status === 'won',
        };

  return (
    <GameShell meta={meta} puzzleNumber={puzzleNumber} date={date} result={result} help={<Help />}>
      <Board
        guesses={state.guesses}
        current={current}
        answer={answer}
        shake={shake}
        revealRow={revealing ? state.guesses.length - 1 : undefined}
        bounceRow={
          !revealing && justFinished && status === 'won' ? state.guesses.length - 1 : undefined
        }
      />
      <Keyboard
        onKey={onKey}
        disabled={status !== 'playing'}
        keyClassName={(k) => (keyStates[k] ? KEY_COLORS[keyStates[k]] : undefined)}
      />
    </GameShell>
  );
}

function Help() {
  return (
    <>
      <p>
        Endevina la paraula de {WORD_LENGTH} lletres en {MAX_GUESSES} intents.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <span className="text-correct font-bold">Verd</span>: la lletra hi és i al lloc correcte.
        </li>
        <li>
          <span className="text-present font-bold">Groc</span>: la lletra hi és però en un altre
          lloc.
        </li>
        <li>
          <span className="text-absent font-bold">Gris</span>: la lletra no hi és.
        </li>
      </ul>
      <p>Els accents no compten. La Ç és una lletra pròpia.</p>
    </>
  );
}
