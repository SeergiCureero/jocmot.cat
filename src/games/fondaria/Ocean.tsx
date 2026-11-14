import { prefersReducedMotion } from '@/lib/dom';

/** Fondària màxima possible (7 preguntes de 100 m). */
export const MAX_DEPTH = 700;

const W = 360;
const H = 300;
const TOP = 44; // la superfície
const BOTTOM = 262; // el fons marí
const SUB_X = 196;

/** Posició vertical del submarí: les primeres respostes ja es noten molt (escala no lineal). */
const yFor = (depth: number) =>
  TOP + Math.pow(Math.min(depth, MAX_DEPTH) / MAX_DEPTH, 0.72) * (BOTTOM - TOP - 22);

const MARKS = [0, 100, 200, 300, 400, 500, 600, 700];

/**
 * L'escena de Fondària: un submarí que s'enfonsa cada cop que encertes, més avall com més rara és
 * la resposta. L'aigua s'enfosqueix, apareixen criatures de les profunditats i s'encén el llum.
 * És decoratiu (el número de metres també és al text de dalt).
 */
export default function Ocean({ depth, gain }: { depth: number; gain: number | null }) {
  const motion = !prefersReducedMotion();
  const y = yFor(depth);
  const deep = depth / MAX_DEPTH;

  return (
    <figure
      className="relative mb-4 w-full overflow-hidden rounded-2xl border border-cyan-900/20 bg-cyan-950"
      aria-label={`Fondària: ${depth} metres`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-hidden>
        <defs>
          <linearGradient id="fond-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="0.28" stopColor="#0e7490" />
            <stop offset="0.62" stopColor="#0c4a6e" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="fond-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fde68a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Cel i aigua */}
        <rect width={W} height={H} fill="url(#fond-water)" />
        <rect width={W} height={TOP - 6} fill="#e0f2fe" />
        <path
          d={`M0 ${TOP - 6} q 15 -8 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 V ${TOP + 6} H0 Z`}
          fill="#bae6fd"
        />

        {/* Marques de fondària */}
        {MARKS.map((m) => {
          const my = yFor(m);
          return (
            <g key={m} opacity={0.75}>
              <line
                x1="0"
                x2={W}
                y1={my}
                y2={my}
                stroke="#e0f2fe"
                strokeOpacity="0.18"
                strokeDasharray="3 6"
              />
              <text x="8" y={my - 3} fontSize="10" fontWeight="700" fill="#e0f2fe">
                {m} m
              </text>
            </g>
          );
        })}

        {/* Criatures: apareixen a mesura que baixes */}
        <g fill="#7dd3fc" opacity={deep > 0.08 ? 0.5 : 0}>
          <path d="M290 98 q 14 -10 28 0 q -14 10 -28 0 Z M318 98 l 10 -7 v 14 Z" />
        </g>
        <g fill="#fbcfe8" opacity={deep > 0.3 ? 0.55 : 0}>
          <path d="M70 150 a 14 12 0 0 1 28 0 Z" />
          <path
            d="M74 150 q 0 16 -3 22 M82 150 q 0 18 0 24 M90 150 q 0 14 4 20"
            stroke="#fbcfe8"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <g opacity={deep > 0.6 ? 0.8 : 0}>
          <path d="M250 214 q 22 -20 46 -2 q -6 18 -26 22 q -16 0 -20 -20 Z" fill="#1e293b" />
          <circle cx="288" cy="208" r="3" fill="#fef08a" />
          <path d="M270 196 q 6 -16 20 -18" stroke="#1e293b" strokeWidth="2" fill="none" />
          <circle cx="290" cy="178" r="3.5" fill="#fef08a" />
        </g>

        {/* Fons marí */}
        <path
          d={`M0 ${H} V ${BOTTOM + 8} q 30 -14 60 -4 t 70 2 t 80 -6 t 70 4 t 80 -2 V ${H} Z`}
          fill="#0f172a"
        />
        <path
          d={`M0 ${H} V ${BOTTOM + 22} q 50 -10 100 0 t 120 -2 t 140 2 V ${H} Z`}
          fill="#020617"
        />

        {/* Bombolles */}
        {motion &&
          [0, 1, 2, 3].map((i) => (
            <circle key={i} cx={SUB_X - 30 - i * 7} r={2 + (i % 2)} fill="#e0f2fe" opacity="0.7">
              <animate
                attributeName="cy"
                values={`${y - 6};${Math.max(TOP, y - 70)}`}
                dur={`${2.2 + i * 0.5}s`}
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.7;0"
                dur={`${2.2 + i * 0.5}s`}
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

        {/* El submarí (baixa amb una transició) */}
        <g
          style={{
            transform: `translate(${SUB_X}px, ${y}px)`,
            transition: motion ? 'transform 1.4s cubic-bezier(0.3, 0.7, 0.2, 1)' : 'none',
          }}
        >
          {/* feix de llum: es veu més quan és fosc */}
          <path
            d="M26 -2 L120 -34 L120 34 L26 6 Z"
            fill="url(#fond-beam)"
            opacity={0.25 + deep * 0.75}
          />
          <g>
            {motion && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 -3; 0 0"
                dur="2.6s"
                repeatCount="indefinite"
              />
            )}
            <rect
              x="-30"
              y="-12"
              width="62"
              height="24"
              rx="12"
              fill="#facc15"
              stroke="#a16207"
              strokeWidth="2"
            />
            <rect
              x="-10"
              y="-22"
              width="22"
              height="12"
              rx="4"
              fill="#facc15"
              stroke="#a16207"
              strokeWidth="2"
            />
            <line x1="2" y1="-22" x2="2" y2="-30" stroke="#a16207" strokeWidth="2" />
            <circle cx="-14" cy="0" r="4.5" fill="#bae6fd" stroke="#a16207" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4.5" fill="#bae6fd" stroke="#a16207" strokeWidth="1.5" />
            <circle cx="14" cy="0" r="4.5" fill="#bae6fd" stroke="#a16207" strokeWidth="1.5" />
            <path d="M-30 -4 l -9 -6 v 20 l 9 -6 Z" fill="#a16207" />
          </g>
        </g>
      </svg>

      <div className="pointer-events-none absolute top-1 right-3 text-right">
        <p className="text-3xl leading-none font-extrabold text-white tabular-nums drop-shadow">
          {depth} <span className="text-lg">m</span>
        </p>
        {gain ? (
          <p key={depth} className="animate-rise mt-0.5 text-sm font-bold text-amber-200">
            +{gain} m ▼
          </p>
        ) : null}
      </div>
    </figure>
  );
}
