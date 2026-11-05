import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface HelpStep {
  text: ReactNode;
  /** Exemple visual petit (fitxes, graella...). */
  example?: ReactNode;
}

/** Instruccions d'un joc: 3 passos com a màxim, numerats i amb un exemple visual. */
export default function HowTo({ steps }: { steps: HelpStep[] }) {
  return (
    <ol className="space-y-4">
      {steps.slice(0, 3).map((step, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="grid size-7 shrink-0 place-items-center rounded-full bg-stone-900 text-sm font-bold text-white"
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-stone-800">{step.text}</p>
            {step.example && (
              <div className="mt-2" aria-hidden>
                {step.example}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Fitxa d'exemple (lletra en un quadrat). */
export function Tile({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'grid size-9 place-items-center rounded-md border-2 text-base font-bold uppercase',
        className ?? 'border-stone-300 bg-white',
      )}
    >
      {children}
    </span>
  );
}

export function TileRow({ children }: { children: ReactNode }) {
  return <span className="flex gap-1">{children}</span>;
}
