import { useEffect, useState } from 'react';
import { SITE } from '@/config/site';
import { getPuzzleDate, getTodayPuzzleNumber } from '@/games/puzzles';
import { startOfDayInTimeZone } from '@/lib/date';

/** Temps que falta per als puzles de demà (mitjanit a Madrid). */
export default function Countdown({ label = 'Puzles nous en' }: { label?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = startOfDayInTimeZone(getPuzzleDate(getTodayPuzzleNumber() + 1), SITE.timeZone);
  const left = Math.max(0, Math.floor((next.getTime() - now) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = `${Math.floor(left / 3600)}:${pad(Math.floor(left / 60) % 60)}:${pad(left % 60)}`;

  return (
    <p className="text-center text-sm text-stone-600">
      {label}{' '}
      <strong className="font-semibold text-stone-900 tabular-nums" role="timer">
        {time}
      </strong>
    </p>
  );
}
