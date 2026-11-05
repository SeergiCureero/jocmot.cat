import { useCallback, useEffect, useMemo, useState } from 'react';
import GameShell from '@/components/game/GameShell';
import Keyboard, { BACKSPACE, ENTER } from '@/components/game/Keyboard';
import { useGameMessage } from '@/components/game/GameMessage';
import { SITE } from '@/config/site';
import { useGameProgress } from '@/features/progress/useGameProgress';
import { useSettings } from '@/features/settings/settings';
import { loadFiveLetterWords } from '@/lib/dictionary';
import { prefersReducedMotion } from '@/lib/dom';
import { storage } from '@/lib/storage';
import { normalizeWord } from '@/lib/text';
import { pickByNumber } from '../puzzles';
import type { GameProps } from '../types';
import Board, { REVEAL_MS } from './components/Board';
import { ANSWERS } from './data/answers';
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

const SOLUTIONS = new Set(ANSWERS.map(normalizeWord));

const PRAISE = ['Genial!', 'Magnífic!', 'Impressionant!', 'Molt bé!', 'Bé!', 'Pel pèl!'];

const KEY_COLORS = {
  correct: 'bg-correct text-on-correct',
  present: 'bg-present text-on-present',
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
  // Les lletres a mig escriure també es desen: en tornar, hi són.
  const draftKey = `draft:${meta.id}:${puzzleNumber}`;
  const [current, setCurrentState] = useState(() => storage.get<string>(draftKey) ?? '');
  const setCurrent = useCallback(
    (fn: (c: string) => string) =>
      setCurrentState((c) => {
        const next = fn(c);
        if (next) storage.set(draftKey, next);
        else storage.remove(draftKey);
        return next;
      }),
    [draftKey],
  );
  const [shake, setShake] = useState(false);
  // Mentre es revela una fila no s'accepten tecles, i el teclat i el resultat esperen al final.
  const [revealing, setRevealing] = useState(false);
  // La partida s'ha acabat en aquesta visita? (per celebrar-ho només llavors)
  const [justFinished, setJustFinished] = useState(false);
  const { message, say } = useGameMessage();
  const { highContrast } = useSettings();
  // Diccionari de 5 lletres. Mentre es descarrega (o si falla) s'accepta qualsevol paraula.
  const [dictionary, setDictionary] = useState<Set<string> | null>(null);
  useEffect(() => {
    loadFiveLetterWords().then(setDictionary);
  }, []);
  const isValidWord = useCallback(
    (w: string) => !dictionary || dictionary.has(w) || SOLUTIONS.has(w),
    [dictionary],
  );

  const keyStates = useMemo(
    () => keyboardStates(revealing ? state.guesses.slice(0, -1) : state.guesses, answer),
    [revealing, state.guesses, answer],
  );

  useEffect(() => {
    if (!revealing) return;
    const id = setTimeout(
      () => {
        setRevealing(false);
        if (status === 'won') say(PRAISE[state.guesses.length - 1], 'ok');
        else if (status === 'lost') say('Aquesta vegada no ha pogut ser', 'error');
      },
      prefersReducedMotion() ? 0 : REVEAL_MS,
    );
    return () => clearTimeout(id);
  }, [revealing, status, state.guesses.length, say]);

  const onKey = useCallback(
    (key: string) => {
      if (status !== 'playing' || revealing) return;
      if (key === BACKSPACE) return setCurrent((c) => c.slice(0, -1));
      if (key !== ENTER) return setCurrent((c) => (c.length < WORD_LENGTH ? c + key : c));

      const result = submitGuess(state, current, answer, isValidWord);
      if ('error' in result) {
        say(
          result.error === 'too-short'
            ? `La paraula ha de tenir ${WORD_LENGTH} lletres`
            : 'Aquesta paraula no és al diccionari',
          'error',
        );
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      update(() => result.state);
      setCurrent(() => '');
      setRevealing(true);
      setJustFinished(getStatus(result.state) !== 'playing');
    },
    [status, revealing, state, current, answer, isValidWord, update, say, setCurrent],
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
          // En alt contrast, els mateixos colors que es veuen: taronja (encert) i blau (present).
          shareText: highContrast
            ? buildShareText(puzzleNumber, state, answer, shareUrl)
                .replaceAll('🟩', '🟧')
                .replaceAll('🟨', '🟦')
            : buildShareText(puzzleNumber, state, answer, shareUrl),
          won: status === 'won',
        };

  return (
    <GameShell
      meta={meta}
      puzzleNumber={puzzleNumber}
      date={date}
      result={result}
      message={message}
    >
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
