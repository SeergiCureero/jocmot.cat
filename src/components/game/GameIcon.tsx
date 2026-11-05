import type { GameId } from '@/games/types';
import { cn } from '@/lib/cn';

/**
 * Icona d'un joc (public/jocs/<joc>.svg, de la carpeta identitat/).
 * És decorativa: el nom del joc sempre va al costat en text.
 */
export default function GameIcon({
  id,
  size = 44,
  className,
}: {
  id: GameId;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={`/jocs/${id}.svg`}
      alt=""
      width={size}
      height={size}
      decoding="async"
      className={cn('shrink-0 select-none', className)}
      draggable={false}
    />
  );
}
