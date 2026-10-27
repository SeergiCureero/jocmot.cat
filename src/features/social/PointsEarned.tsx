import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import { social, type Score } from './api';

/**
 * Punts guanyats amb aquesta partida (a la finestra de resultat).
 * El servidor els calcula en rebre la partida acabada: ho reintentem uns quants cops.
 */
export default function PointsEarned({ game, puzzle }: { game: string; puzzle: number }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [score, setScore] = useState<Score | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const attempt = (n: number) =>
      social.score(game, puzzle).then(
        (s) => !cancelled && setScore(s),
        () => {
          if (!cancelled && n < 6) timer = setTimeout(() => attempt(n + 1), 700);
        },
      );
    void attempt(1);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userId, game, puzzle]);

  if (!user) {
    return (
      <Link
        to={`/compte/registre?seguent=${encodeURIComponent(pathname)}`}
        className="block rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900 hover:bg-amber-100"
      >
        🏆 Crea un compte per guanyar punts i competir amb amics →
      </Link>
    );
  }
  if (!score) return null;

  return (
    <div className="animate-rise flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
      <div>
        <p className="text-2xl font-extrabold text-amber-900">+{score.points} punts</p>
        <p className="text-xs text-amber-800">
          {score.bonus > 0 && `${score.base} + ${score.bonus} de ratxa`}
          {!score.daily && 'Puzle de l’arxiu: la meitat de punts'}
          {score.daily && !score.bonus && score.points === 0 && 'Demà serà!'}
        </p>
      </div>
      {score.daily && score.streak > 0 && (
        <p className="text-right text-sm font-semibold text-orange-600">
          🔥 {score.streak} {score.streak === 1 ? 'dia' : 'dies'}
          <span className="block text-xs font-normal text-stone-500">de ratxa</span>
        </p>
      )}
    </div>
  );
}
