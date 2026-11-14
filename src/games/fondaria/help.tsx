import HowTo from '@/components/game/HowTo';
import { ROUND_SECONDS, ROUNDS } from './logic';

export default function FondariaHelp() {
  return (
    <HowTo
      steps={[
        {
          text: (
            <>
              Cada dia hi ha <strong>{ROUNDS} preguntes</strong>. Tens {ROUND_SECONDS} segons per
              respondre-les.
            </>
          ),
          example: (
            <p className="rounded-xl bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-950">
              Digues un animal
            </p>
          ),
        },
        {
          text: (
            <>
              <strong>Com més rara la resposta, més fons</strong>: les habituals (gat, Barcelona…)
              valen poc i les rares molt.
            </>
          ),
          example: (
            <p className="flex gap-1.5 text-xs font-semibold">
              <span className="rounded bg-stone-200 px-2 py-1">GAT +10</span>
              <span className="rounded bg-red-700 px-2 py-1 text-white">PANGOLÍ +96</span>
            </p>
          ),
        },
        {
          text: (
            <>
              Hi ha animals, països, menjar, música… de tot. No pots repetir respostes. Si no et
              surt, passa a la següent!
            </>
          ),
        },
      ]}
    />
  );
}
