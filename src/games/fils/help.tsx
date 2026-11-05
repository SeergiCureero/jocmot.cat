import HowTo from '@/components/game/HowTo';
import { cn } from '@/lib/cn';
import { HINT_COST } from './logic';

/** Graella petita d'exemple: les lletres marcades formen la paraula. */
function MiniGrid({
  letters,
  marked,
  spangram,
}: {
  letters: string;
  marked: number[];
  spangram?: boolean;
}) {
  return (
    <span className="grid w-fit grid-cols-4 gap-1">
      {letters.split('').map((l, i) => (
        <span
          key={i}
          className={cn(
            'grid size-8 place-items-center rounded-full text-sm font-bold',
            marked.includes(i) ? (spangram ? 'bg-amber-300' : 'bg-sky-300') : 'bg-stone-100',
          )}
        >
          {l}
        </span>
      ))}
    </span>
  );
}

export default function FilsHelp() {
  return (
    <HowTo
      steps={[
        {
          text: 'Uneix lletres veïnes (també en diagonal) per trobar les paraules del tema del dia.',
          example: <MiniGrid letters="GATCOSIP" marked={[0, 1, 2]} />,
        },
        {
          text: (
            <>
              El <strong>fil conductor</strong> descriu el tema i creua la graella d’un costat a
              l’altre.
            </>
          ),
          example: <MiniGrid letters="FILSARET" marked={[0, 1, 2, 3]} spangram />,
        },
        {
          text: `Les altres paraules que trobis també compten: cada ${HINT_COST} et donen una pista.`,
        },
      ]}
    />
  );
}
