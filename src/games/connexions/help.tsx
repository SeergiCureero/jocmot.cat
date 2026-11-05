import HowTo from '@/components/game/HowTo';
import { cn } from '@/lib/cn';
import LevelSymbol from './components/LevelSymbol';
import { MAX_MISTAKES } from './logic';
import type { Level } from './types';

const LEVELS: { level: Level; bg: string; label: string }[] = [
  { level: 0, bg: 'bg-level-0', label: 'Fàcil' },
  { level: 1, bg: 'bg-level-1', label: '' },
  { level: 2, bg: 'bg-level-2', label: '' },
  { level: 3, bg: 'bg-level-3', label: 'Difícil' },
];

export default function ConnexionsHelp() {
  return (
    <HowTo
      steps={[
        {
          text: (
            <>
              Tria quatre paraules que tinguin alguna cosa en comú i prem <strong>Envia</strong>.
            </>
          ),
          example: (
            <span className="grid grid-cols-4 gap-1 text-[11px] font-bold uppercase">
              {['Poma', 'Taula', 'Pera', 'Cadira'].map((w, i) => (
                <span
                  key={w}
                  className={cn(
                    'grid h-9 place-items-center rounded-md',
                    i % 2 === 0 ? 'bg-stone-700 text-white' : 'bg-stone-200',
                  )}
                >
                  {w}
                </span>
              ))}
            </span>
          ),
        },
        {
          text: `Si l’encertes, el grup es descobreix. Pots fallar ${MAX_MISTAKES} vegades.`,
          example: (
            <span className="bg-level-0 flex h-11 flex-col items-center justify-center rounded-md text-xs uppercase">
              <strong>
                <LevelSymbol level={0} className="mr-1" />
                Fruites
              </strong>
              <span>Poma, pera, préssec, pruna</span>
            </span>
          ),
        },
        {
          text: 'Els colors van del grup més fàcil al més difícil. Compte amb les paraules que semblen de dos grups!',
          example: (
            <span className="flex items-center gap-1 text-xs text-stone-600">
              {LEVELS.map(({ level, bg, label }) => (
                <span key={level} className="flex items-center gap-1">
                  {label && level === 3 && <span>→</span>}
                  <span className={cn('grid h-7 w-10 place-items-center rounded text-sm', bg)}>
                    <LevelSymbol level={level} />
                  </span>
                  {label && level === 0 && <span className="mr-1">{label}</span>}
                  {label && level === 3 && <span>{label}</span>}
                </span>
              ))}
            </span>
          ),
        },
      ]}
    />
  );
}
