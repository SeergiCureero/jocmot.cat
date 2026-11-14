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
              escriure una paraula que les compleixi.
            </>
          ),
          example: (
            <p className="rounded-xl bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-950">
              Una paraula que comenci per «PA»
            </p>
          ),
        },
        {
          text: (
            <>
              <strong>Com més rara la paraula, més fons</strong>: les llargues i les que tenen
              lletres poc habituals valen més punts.
            </>
          ),
          example: (
            <p className="flex gap-1.5 text-xs font-semibold">
              <span className="rounded bg-stone-200 px-2 py-1">PAST +10</span>
              <span className="rounded bg-red-700 px-2 py-1 text-white">XERRAC +56</span>
            </p>
          ),
        },
        {
          text: (
            <>
              No pots repetir paraules, i han de ser al diccionari. Si no et surt, passa a la
              següent!
            </>
          ),
        },
      ]}
    />
  );
}
