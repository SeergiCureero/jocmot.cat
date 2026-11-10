import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { HeartIcon } from '@/components/icons';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/cn';
import { social, type Likes } from './api';

const BOX =
  'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-150';

/**
 * "M'agrada" d'un puzle (a la finestra del resultat). Respon a l'instant i després ho desa.
 * Sense compte es veu el recompte i convida a entrar.
 */
export default function LikeButton({ game, puzzle }: { game: string; puzzle: number }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const toast = useToast();
  const [likes, setLikes] = useState<Likes | null>(null);
  const [failed, setFailed] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    let cancelled = false;
    social.likes(game, puzzle).then(
      (l) => !cancelled && setLikes(l),
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
    };
  }, [game, puzzle, userId]);

  if (failed) return null;
  const count = likes?.count ?? 0;
  const label = count === 1 ? '1 persona' : `${count} persones`;

  if (!user)
    return (
      <Link
        to={`/compte/entrar?seguent=${encodeURIComponent(pathname)}`}
        className={cn(BOX, 'border-stone-300 bg-white text-stone-800 hover:bg-stone-100')}
      >
        <HeartIcon className="size-5" />
        T’ha agradat?
        {count > 0 && <span className="font-normal text-stone-600">· {count}</span>}
      </Link>
    );

  async function toggle() {
    if (!likes) return;
    const previous = likes;
    const liked = !likes.liked;
    setLikes({ liked, count: likes.count + (liked ? 1 : -1) });
    try {
      setLikes(await social.setLike(game, puzzle, liked));
    } catch (e) {
      setLikes(previous);
      toast((e as Error).message);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!likes}
      aria-pressed={likes?.liked ?? false}
      aria-label={`M’agrada aquest puzle (${label})`}
      className={cn(
        BOX,
        'enabled:active:scale-95',
        likes?.liked
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-100',
      )}
    >
      <HeartIcon filled={likes?.liked} className={cn('size-5', likes?.liked && 'animate-pop')} />
      {likes?.liked ? 'T’agrada' : 'M’agrada'}
      <span className="font-normal tabular-nums" aria-hidden>
        · {count}
      </span>
    </button>
  );
}
