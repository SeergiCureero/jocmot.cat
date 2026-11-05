import { cn } from '@/lib/cn';
import type { ConnexionsGroup, Level } from '../types';
import LevelSymbol from './LevelSymbol';

const LEVEL_BG: Record<Level, string> = {
  0: 'bg-level-0',
  1: 'bg-level-1',
  2: 'bg-level-2',
  3: 'bg-level-3',
};

export default function GroupBar({
  group,
  delayMs = 0,
}: {
  group: ConnexionsGroup;
  delayMs?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delayMs}ms` }}
      className={cn(
        'animate-group-in flex h-16 flex-col items-center justify-center rounded-lg text-center sm:h-20',
        LEVEL_BG[group.level],
      )}
    >
      <p className="text-sm font-bold uppercase">
        <LevelSymbol level={group.level} className="mr-1.5" />
        {group.title}
      </p>
      <p className="text-xs uppercase sm:text-sm">{group.words.join(', ')}</p>
    </div>
  );
}
