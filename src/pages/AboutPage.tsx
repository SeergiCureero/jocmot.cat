import { Link } from 'react-router';
import Prose from '@/components/ui/Prose';
import { FEATURES, SITE } from '@/config/site';
import { GAMES } from '@/games/registry';
import Icon from '@/components/ui/Icon';

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl py-8">
      <h1 className="animate-rise mb-6 text-3xl font-extrabold tracking-tight">
        Sobre {SITE.name}
      </h1>
      <Prose>
        <p className="text-lg">
          {SITE.name} és un racó per jugar amb el català cada dia: uns quants minuts, uns quants
          puzles i el gust de trobar la paraula justa.
        </p>
        <p>
          Cada dia, a mitjanit (hora de Barcelona), surten puzles nous. Són els mateixos per a
          tothom, així que pots comparar el resultat amb la família, els amics o la colla de la
          feina, sense espòilers: el resultat es comparteix amb quadrets de colors.
        </p>

        <h2>Els jocs</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {GAMES.map((g) => (
            <li key={g.id} className="ml-0! list-none!">
              <Link
                to={`/${g.slug}`}
                className="flex h-full items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 font-normal! text-stone-700! no-underline! transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl text-xl ${g.theme.bg}`}
                >
                  <Icon name={g.icon} />
                </span>
                <span>
                  <strong className="block">{g.name}</strong>
                  <span className="block text-sm">{g.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2>Qui hi ha al darrere</h2>
        <p>
          Som un petit equip d’amants del català. Els puzles els pensem, els provem i els revisem
          entre nosaltres abans de publicar-los.
        </p>
        <p>
          Els jocs s’inspiren en clàssics com el Wordle, el Connections, el Strands o el Mini
          Crossword, però tots els puzles són originals i pensats per al català.
        </p>

        {FEATURES.social && (
          <>
            <h2>Juga amb els amics</h2>
            <p>
              Amb un compte gratuït, el teu progrés es guarda a tots els dispositius, sumes punts,
              mantens la ratxa i pots crear <Link to="/lligues">lligues</Link> mensuals per competir
              amb qui vulguis.
            </p>
          </>
        )}

        <h2>Gratuït i sense galetes de seguiment</h2>
        <p>
          Jugar és gratuït i no cal registrar-se. No fem servir galetes de publicitat ni
          d’analítica, i les dades mínimes que guardem s’expliquen a la{' '}
          <Link to="/legal#privadesa">política de privadesa</Link>.
        </p>

        <h2>Parla amb nosaltres</h2>
        <p>
          Has trobat un error en un puzle? Tens una idea per a un joc nou? Escriu-nos a{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Llegim tots els correus.
        </p>
      </Prose>
    </article>
  );
}
