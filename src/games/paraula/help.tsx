import HowTo, { Tile, TileRow } from '@/components/game/HowTo';
import { useSettings } from '@/features/settings/settings';
import { MAX_GUESSES, WORD_LENGTH } from './logic';

export default function ParaulaHelp() {
  const { highContrast } = useSettings();
  const [good, near] = highContrast ? ['Taronja', 'Blau'] : ['Verd', 'Groc'];
  return (
    <HowTo
      steps={[
        {
          text: (
            <>
              Escriu una paraula de {WORD_LENGTH} lletres i prem <strong>Envia</strong>. Tens{' '}
              {MAX_GUESSES} intents.
            </>
          ),
          example: (
            <TileRow>
              {'CASAL'.split('').map((l, i) => (
                <Tile key={i} className="border-stone-500 bg-white">
                  {l}
                </Tile>
              ))}
            </TileRow>
          ),
        },
        {
          text: (
            <>
              <strong>{good}</strong>: la lletra és al lloc bo. <strong>{near}</strong>: hi és, però
              en un altre lloc. <strong>Gris</strong>: no hi és.
            </>
          ),
          example: (
            <TileRow>
              <Tile className="bg-correct border-correct text-on-correct">C</Tile>
              <Tile className="bg-absent border-absent text-white">O</Tile>
              <Tile className="bg-present border-present text-on-present">R</Tile>
              <Tile className="bg-absent border-absent text-white">D</Tile>
              <Tile className="bg-absent border-absent text-white">E</Tile>
            </TileRow>
          ),
        },
        {
          text: 'Valen plurals, femenins i verbs. Els accents no compten, i la Ç és una lletra més.',
        },
      ]}
    />
  );
}
