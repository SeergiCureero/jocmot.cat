import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import GameShell from '@/components/game/GameShell';
import { useGameMessage } from '@/components/game/GameMessage';
import { SITE } from '@/config/site';
import { useGameProgress } from '@/features/progress/useGameProgress';
import { useAuth } from '@/features/auth/AuthContext';
import { normalizeWord } from '@/lib/text';
import { backend } from '@/services/backend';
import Ocean from './Ocean';
import { cn } from '@/lib/cn';
import type { GameProps } from '../types';
import {
  addAnswer,
  buildPrompts,
  buildShareText,
  expireRounds,
  fitsPrompt,
  getStatus,
  initialState,
  ROUNDS,
  ROUND_SECONDS,
  secondsLeft,
  tierFor,
  totalDepth,
  pointsFor,
} from './logic';
import { meta } from './meta';

/** Colors de cada nivell de raresa (de molt habitual a molt rara). Fons amb text fosc o blanc, contrast ≥ 4.5:1. */
const TIER_CLASS = [
  'bg-stone-200 text-stone-800',
  'bg-sky-200 text-sky-950',
  'bg-emerald-200 text-emerald-950',
  'bg-amber-200 text-amber-950',
  'bg-orange-600 text-white',
  'bg-red-700 text-white',
];
const TIER_NAME = ['Habitual', 'Corrent', 'Interessant', 'Poc comuna', 'Rara', 'Molt rara'];

/** Avisa el servidor de les preguntes que s'han acabat sense resposta (no passa res si falla). */
function reportSkips(puzzle: number, from: number, to: number) {
  void (async () => {
    for (let round = from; round < to; round++) {
      try {
        await backend.call('/fondaria/passa', { method: 'POST', body: { puzzle, round } });
      } catch {
        return;
      }
    }
  })();
}

export default function FondariaGame({ puzzleNumber, date, preview }: GameProps) {
  const prompts = useMemo(() => buildPrompts(puzzleNumber), [puzzleNumber]);
  const { state, update, status } = useGameProgress({
    gameId: meta.id,
    puzzleId: puzzleNumber,
    initialState: () => initialState(),
    getStatus,
    persist: !preview,
  });
  const { user } = useAuth();
  // Amb compte i servidor, el servidor valida cada resposta i en calcula els punts (amb la comunitat).
  const online = backend.kind === 'pocketbase' && Boolean(user) && !preview;
  const { message, say } = useGameMessage();
  const [text, setText] = useState('');
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const input = useRef<HTMLInputElement>(null);

  // En tornar a la pàgina, les rondes que han caducat mentrestant es donen per perdudes.
  useEffect(() => {
    update((s) => expireRounds(s, Date.now()));
  }, [update]);

  const round = state.answers.length;
  const playing = status === 'playing';

  // Rellotge: cada 200 ms; quan s'acaba el temps, passa a la ronda següent.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (secondsLeft(state, t) <= 0) {
        const next = expireRounds(state, t);
        if (online) reportSkips(puzzleNumber, state.answers.length, next.answers.length);
        update((s) => expireRounds(s, t));
        setText('');
        say('S’ha acabat el temps', 'error');
      }
    }, 200);
    return () => clearInterval(id);
  }, [playing, state, update, say, online, puzzleNumber]);

  useEffect(() => {
    if (playing) input.current?.focus();
  }, [playing, round]);

  const submit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (!playing || checking) return;
      const prompt = prompts[round];
      const word = normalizeWord(text);
      if (!word) {
        say('Escriu una resposta', 'error');
        return;
      }
      if (state.answers.some((a) => a.word === word)) {
        say('Aquesta ja l’has dit', 'error');
        return;
      }
      let points: number;
      if (online) {
        setChecking(true);
        try {
          const res = await backend.call<{ known: boolean; points?: number }>(
            '/fondaria/resposta',
            { method: 'POST', body: { puzzle: puzzleNumber, round, word: text } },
          );
          if (!res.known) {
            say('No la tenim. L’hem apuntada perquè l’equip la revisi', 'error');
            return;
          }
          points = res.points ?? 0;
        } catch (e) {
          say((e as Error).message, 'error');
          return;
        } finally {
          setChecking(false);
        }
      } else {
        if (!fitsPrompt(prompt, text)) {
          say('Aquesta no la tenim a la llista', 'error');
          return;
        }
        points = pointsFor(prompt, word);
      }
      const t = Date.now();
      // El temps pot haver caducat mentre es comprovava: llavors compta com a perdut.
      update((s) =>
        secondsLeft(s, t) <= 0 ? expireRounds(s, t) : addAnswer(s, { word, points }, t),
      );
      setText('');
    },
    [playing, checking, prompts, round, text, state.answers, update, say, online, puzzleNumber],
  );

  const left = playing ? secondsLeft(state, now) : 0;
  const depth = totalDepth(state);
  const shareUrl = `${SITE.url}/${meta.slug}`;
  const result = playing
    ? null
    : {
        title: `Has arribat als ${depth} m`,
        body: <>De {ROUNDS * 100} m possibles. Com més rara la resposta, més fons!</>,
        shareText: buildShareText(puzzleNumber, state, shareUrl),
        won: depth >= 250,
      };

  return (
    <GameShell
      meta={meta}
      puzzleNumber={puzzleNumber}
      date={date}
      result={result}
      message={message}
      progress={round / ROUNDS}
      preview={preview}
    >
      <div className="w-full max-w-sm px-1">
        <Ocean depth={depth} gain={state.answers.at(-1)?.points || null} />
        <div className="mb-3 flex items-baseline justify-between text-sm">
          <span className="font-semibold text-stone-700">
            {playing ? `Pregunta ${round + 1} de ${ROUNDS}` : 'Immersió acabada'}
          </span>
          <span className="text-xs text-stone-500">
            {state.answers.filter((a) => a.word).length} encerts
          </span>
        </div>

        {playing && (
          <>
            <div
              className="mb-4 h-2 overflow-hidden rounded-full bg-cyan-100"
              role="timer"
              aria-label={`Queden ${Math.ceil(left)} segons`}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-200 ease-linear',
                  left <= 5 ? 'bg-red-700' : 'bg-cyan-700',
                )}
                style={{ width: `${(left / ROUND_SECONDS) * 100}%` }}
              />
            </div>

            <form onSubmit={submit}>
              <p className="mb-3 min-h-[3.5rem] rounded-2xl bg-cyan-50 px-4 py-3 text-center text-lg font-bold text-cyan-950">
                {prompts[round].text}
              </p>
              <input
                ref={input}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={checking}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="send"
                aria-label="La teva resposta"
                placeholder="Escriu la teva resposta…"
                className="focus:border-brand-600 focus:ring-brand-100 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-center text-lg font-semibold outline-none focus:ring-2"
              />
              <button
                type="submit"
                disabled={checking}
                className="bg-brand-700 hover:bg-brand-900 mt-3 min-h-11 w-full rounded-full font-semibold text-white transition enabled:active:scale-95 disabled:bg-stone-300"
              >
                Envia
              </button>
            </form>
          </>
        )}

        <ol className="mt-5 space-y-1.5" aria-label="Respostes">
          {state.answers.map((a, i) => (
            <li
              key={i}
              className={cn(
                'animate-rise flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold',
                a.word ? TIER_CLASS[tierFor(a.points)] : 'bg-stone-100 text-stone-500',
              )}
            >
              <span className="uppercase">{a.word || 'Sense resposta'}</span>
              <span className="tabular-nums">
                {a.word ? `${TIER_NAME[tierFor(a.points)]} · +${a.points}` : '+0'}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </GameShell>
  );
}
