import { useSettings } from '@/features/settings/settings';
import type { Level } from '../types';

const SYMBOLS: Record<Level, string> = { 0: '●', 1: '▲', 2: '■', 3: '◆' };
const NAMES: Record<Level, string> = {
  0: 'nivell fàcil',
  1: 'nivell mitjà',
  2: 'nivell difícil',
  3: 'nivell molt difícil',
};

/**
 * Símbol del nivell (només en mode d'alt contrast): així el grup no depèn només del color.
 */
export default function LevelSymbol({ level, className }: { level: Level; className?: string }) {
  const { highContrast } = useSettings();
  if (!highContrast) return null;
  return (
    <span className={className}>
      <span aria-hidden>{SYMBOLS[level]}</span>
      <span className="sr-only">{NAMES[level]}</span>
    </span>
  );
}
