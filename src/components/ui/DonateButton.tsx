import { SITE } from '@/config/site';
import { cn } from '@/lib/cn';

interface Props {
  className?: string;
}

/** Enllaç discret de donatius que obre Stripe en una pestanya nova. */
export default function DonateButton({ className }: Props) {
  if (!SITE.donateUrl) return null;
  return (
    <a
      href={SITE.donateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-100 hover:text-stone-800',
        className,
      )}
    >
      ☕ Convida’ns a un cafè
    </a>
  );
}
