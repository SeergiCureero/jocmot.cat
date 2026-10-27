import { useMemo, type CSSProperties } from 'react';

const COLORS = ['#facc15', '#4ade80', '#60a5fa', '#c084fc', '#f472b6', '#14b8a6'];
const PIECES = 60;

/** Pluja de confeti per celebrar una victòria. Decoratiu: no rep clics ni el llegeixen els lectors de pantalla. */
export default function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        left: Math.random() * 100,
        width: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 600,
        fall: 2 + Math.random() * 1.5,
        drift: (Math.random() - 0.5) * 30,
        spin: (Math.random() - 0.5) * 1440,
        round: Math.random() < 0.3,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 block"
          style={
            {
              left: `${p.left}%`,
              width: p.width,
              height: p.round ? p.width : p.width * 0.45,
              borderRadius: p.round ? '9999px' : '2px',
              backgroundColor: p.color,
              animationDelay: `${p.delay}ms`,
              '--fall': `${p.fall}s`,
              '--drift': `${p.drift}vw`,
              '--spin': `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
