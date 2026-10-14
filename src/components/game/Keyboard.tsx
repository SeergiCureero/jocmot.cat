import { useEffect } from 'react';
import { cn } from '@/lib/cn';

export const ENTER = 'ENTER';
export const BACKSPACE = 'BACKSPACE';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  [ENTER, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', BACKSPACE],
];

interface Props {
  onKey: (key: string) => void;
  /** Classes per lletra (p. ex. colors d'estat a Paraula). */
  keyClassName?: (key: string) => string | undefined;
  disabled?: boolean;
  showEnter?: boolean;
}

/** Teclat català en pantalla + escolta del teclat físic. */
export default function Keyboard({ onKey, keyClassName, disabled, showEnter = true }: Props) {
  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') onKey(ENTER);
      else if (e.key === 'Backspace') onKey(BACKSPACE);
      else if (/^[a-zç]$/i.test(e.key)) onKey(e.key.toUpperCase());
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKey, disabled]);

  return (
    <div className="mt-6 w-full max-w-lg select-none space-y-1.5" aria-label="Teclat">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row
            .filter((k) => showEnter || k !== ENTER)
            .map((key) => (
              <button
                key={key}
                disabled={disabled}
                onClick={() => onKey(key)}
                aria-label={key === BACKSPACE ? 'Esborra' : key === ENTER ? 'Envia' : key}
                className={cn(
                  'h-13 rounded-md text-sm font-bold uppercase transition active:scale-95',
                  key.length > 1 ? 'flex-[1.5] px-1 text-xs' : 'flex-1',
                  keyClassName?.(key) ?? 'bg-stone-200 text-stone-900 hover:bg-stone-300',
                )}
              >
                {key === BACKSPACE ? '⌫' : key === ENTER ? 'Envia' : key}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
