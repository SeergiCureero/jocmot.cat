import { cn } from '@/lib/cn';

/**
 * Icones de la interfície. Cada una és un fitxer src/assets/icons/<nom>.svg; mentre no hi
 * sigui, es mostra l'emoji provisional. Els SVG s'insereixen tal qual, així que poden fer
 * servir `currentColor` per agafar el color del text.
 */
export const ICONS = {
  // Jocs
  'joc-paraula': '🟩',
  'joc-connexions': '🟪',
  'joc-fils': '🧵',
  'joc-mini': '✏️',
  // Navegació
  arxiu: '📅',
  trofeu: '🏆',
  amics: '👥',
  editor: '✏️',
  correu: '📬',
  // Joc i punts
  ratxa: '🔥',
  pista: '💡',
  corona: '👑',
  'medalla-or': '🥇',
  'medalla-plata': '🥈',
  'medalla-bronze': '🥉',
  // Rangs
  'rang-aprenent': '🌱',
  'rang-lletraferit': '📖',
  'rang-paraulaire': '✒️',
  'rang-erudit': '🎓',
  'rang-mestre-de-mots': '🏛️',
  'rang-gran-mestre': '👑',
} as const;

export type IconName = keyof typeof ICONS;

const SVGS = import.meta.glob<string>('/src/assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Mida per defecte: la del text del voltant (1.2em). Es canvia amb `className` (p. ex. `size-8`). */
export default function Icon({ name, className }: { name: IconName; className?: string }) {
  const svg = SVGS[`/src/assets/icons/${name}.svg`];
  const base = 'inline-block size-[1.2em] shrink-0 align-[-0.2em] leading-none';
  if (svg)
    return (
      <span
        aria-hidden
        className={cn(base, '[&>svg]:size-full', className)}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  return (
    <span aria-hidden className={cn(base, 'text-center', className)}>
      {ICONS[name]}
    </span>
  );
}

/** Quadret o rodona de color (llegenda de colors dels jocs). */
export function Swatch({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-[0.9em] rounded-[3px] align-[-0.1em]', className)}
    />
  );
}
