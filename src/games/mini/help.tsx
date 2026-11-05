import HowTo from '@/components/game/HowTo';
import { cn } from '@/lib/cn';

export default function MiniHelp() {
  const cells = ['S', 'O', 'L', 'A', '', 'A', 'L', 'L', 'U'];
  return (
    <HowTo
      steps={[
        {
          text: 'Omple el mot encreuat amb les definicions horitzontals (H) i verticals (V).',
          example: (
            <span className="grid w-fit grid-cols-3 border-2 border-stone-900">
              {cells.map((l, i) => (
                <span
                  key={i}
                  className={cn(
                    'grid size-9 place-items-center border border-stone-300 text-base font-bold',
                    l === '' ? 'bg-stone-900' : i < 3 ? 'bg-sky-100' : 'bg-white',
                    i === 0 && 'bg-amber-300',
                  )}
                >
                  {l}
                </span>
              ))}
            </span>
          ),
        },
        {
          text: 'Toca una casella per triar-la. Si la tornes a tocar, canvies de direcció. Amb teclat: fletxes i Tab.',
        },
        {
          text: (
            <>
              El rellotge s’atura quan ho tens tot bé. <strong>Comprova</strong> marca les lletres
              errònies i <strong>Revela</strong> mostra la solució.
            </>
          ),
        },
      ]}
    />
  );
}
