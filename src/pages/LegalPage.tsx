import { Link } from 'react-router';
import Prose from '@/components/ui/Prose';
import { SITE } from '@/config/site';

const SECTIONS = [
  ['avis-legal', 'Avís legal'],
  ['privadesa', 'Privadesa'],
  ['galetes', 'Galetes'],
  ['condicions', 'Condicions d’ús'],
] as const;

/** Avís legal, política de privadesa, galetes i condicions d'ús (/legal). */
export default function LegalPage() {
  const mail = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;

  return (
    <article className="mx-auto max-w-2xl py-8">
      <h1 className="animate-rise text-3xl font-extrabold tracking-tight">Informació legal</h1>
      <p className="mt-1 text-sm text-stone-500">Última actualització: {SITE.legalUpdated}</p>

      <nav aria-label="Seccions" className="my-6 flex flex-wrap gap-2">
        {SECTIONS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex min-h-11 items-center rounded-full border border-stone-300 bg-white px-4 text-sm font-medium transition hover:border-stone-400 hover:bg-stone-100"
          >
            {label}
          </a>
        ))}
      </nav>

      <Prose>
        <h2 id="avis-legal">Avís legal</h2>
        <ul>
          <li>
            <strong>Titular:</strong> {SITE.owner}
          </li>
          <li>
            <strong>Lloc web:</strong> {SITE.name}
          </li>
          <li>
            <strong>Contacte:</strong> {mail}
          </li>
        </ul>
        <p>
          {SITE.name} és un projecte personal i sense ànim de lucre de jocs de paraules en català.
          Els textos, els puzles, el disseny i el codi del lloc són dels seus autors; els pots
          compartir i comentar lliurement, però no copiar-los en bloc per publicar-los en un altre
          lloc sense permís.
        </p>
        <p>
          Les llistes de paraules que els jocs accepten deriven del{' '}
          <a
            href="https://github.com/Softcatala/catalan-dict-tools"
            target="_blank"
            rel="noopener noreferrer"
          >
            diccionari obert de Softcatalà
          </a>{' '}
          i es distribueixen, com l’original, amb llicència GPL o LGPL (
          <a href="/diccionari/LLEGEIX-ME.txt">detalls i llicències</a>).
        </p>

        <h2 id="privadesa">Política de privadesa</h2>
        <p>
          Pots jugar sense compte i sense donar-nos cap dada. Només si crees un compte guardem el
          que s’explica aquí, d’acord amb el Reglament general de protecció de dades (RGPD) i la
          Llei orgànica 3/2018 (LOPDGDD).
        </p>

        <h3>Qui és el responsable</h3>
        <p>
          {SITE.owner}, a qui pots escriure a {mail} per a qualsevol qüestió sobre les teves dades.
        </p>

        <h3>Quines dades guardem i per què</h3>
        <ul>
          <li>
            <strong>Correu electrònic i contrasenya</strong> (xifrada; ningú no la pot llegir): per
            entrar al compte i per enviar-te l’enllaç si l’oblides. No t’enviarem publicitat.
          </li>
          <li>
            <strong>Nom d’usuari:</strong> és públic per als altres jugadors (amics, lligues i
            cercador). El correu, en canvi, no el veu ningú més.
          </li>
          <li>
            <strong>Partides, punts i ratxes:</strong> per guardar el progrés a tots els dispositius
            i calcular les classificacions.
          </li>
          <li>
            <strong>Amistats i lligues</strong> a què pertanys, perquè puguis competir amb qui
            triïs.
          </li>
          <li>
            <strong>Avís diari</strong>, només si l’actives al perfil: l’adreça que el teu navegador
            ens dona per enviar-te notificacions i l’hora que has triat. Les notificacions passen
            pel servei del teu navegador (Google, Mozilla, Apple o Microsoft) i no porten cap dada
            teva. Quan el desactives, l’esborrem.
          </li>
          {SITE.donateUrl && (
            <li>
              <strong>Donatius:</strong> si en fas un, el pagament el gestiona Stripe i nosaltres no
              veiem les dades de la targeta. Només en rebem la quantitat i el nom i el correu que hi
              posis.
            </li>
          )}
          <li>
            <strong>Registres tècnics</strong> (adreça IP i data de les peticions): per seguretat i
            per evitar abusos. Es guarden uns quants dies.
          </li>
        </ul>
        <p>
          La base legal és l’execució del servei que demanes en crear el compte (art. 6.1.b del
          RGPD) i, per als registres tècnics, l’interès legítim de mantenir el lloc segur (art.
          6.1.f).
        </p>

        <h3>On són i qui hi té accés</h3>
        <p>No venem ni cedim les dades a ningú. Fem servir aquests proveïdors:</p>
        <ul>
          <li>
            <strong>Hetzner Online</strong> (Alemanya): el servidor on hi ha els comptes, a
            Falkenstein.
          </li>
          <li>
            <strong>Cloudflare Web Analytics</strong>: compta les visites (pàgines vistes, país,
            tipus de dispositiu i navegador) de manera agregada. No fa servir galetes ni crea cap
            identificador, i no guarda la teva adreça IP. Ho fem per l’interès legítim de saber
            quanta gent fa servir el lloc (art. 6.1.f del RGPD).
          </li>
          <li>
            <strong>Brevo</strong> (França): envia els correus del compte, com el de recuperar la
            contrasenya.
          </li>
          <li>
            <strong>Cloudflare</strong>: serveix la web i gestiona el domini i el correu de
            contacte. Pot tractar dades fora de la UE amb les garanties del Marc de privadesa de
            dades UE-EUA i clàusules contractuals tipus.
          </li>
        </ul>

        <h3>Quant de temps</h3>
        <p>
          Mentre tinguis el compte. Quan l’esborres (des del teu <Link to="/compte">perfil</Link>, a
          baix de tot), s’esborren a l’instant totes les dades associades; les còpies de seguretat
          del servidor s’eliminen soles al cap de 14 dies.
        </p>

        <h3>Els teus drets</h3>
        <p>
          Pots demanar en qualsevol moment veure, corregir, descarregar o esborrar les teves dades,
          o oposar-te al tractament, escrivint a {mail} des del correu del compte. Et respondrem en
          menys d’un mes. Si creus que no les hem tractat bé, pots reclamar a l’Agència Espanyola de
          Protecció de Dades (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            aepd.es
          </a>
          ).
        </p>

        <h3>Menors</h3>
        <p>
          Per crear un compte cal tenir 14 anys o més. Si en tens menys, cal que ho faci el teu
          pare, mare o tutor. Per jugar sense compte no hi ha cap límit d’edat.
        </p>

        <h2 id="galetes">Galetes</h2>
        <p>
          {SITE.name} <strong>no fa servir galetes</strong> de publicitat, d’analítica ni de xarxes
          socials. Només guardem al teu navegador (amb l’emmagatzematge local) el progrés de les
          partides i, si entres, la sessió del compte. Són dades estrictament necessàries perquè el
          lloc funcioni, no surten del teu dispositiu tret que tinguis compte, i per això no et
          demanem consentiment. Les pots esborrar quan vulguis des de la configuració del navegador.
        </p>
        <p>
          Per comptar visites fem servir Cloudflare Web Analytics, que{' '}
          <strong>no guarda galetes</strong> ni res al teu navegador (vegeu{' '}
          <a href="#privadesa">privadesa</a>).
        </p>
        <p>Si algun dia afegim publicitat, t’ho demanarem abans i ho explicarem aquí.</p>

        <h2 id="condicions">Condicions d’ús</h2>
        <ul>
          <li>
            Si proposes un puzle a l’editor, ens autoritzes a publicar-lo a {SITE.name}, de franc, i
            a corregir-ne o adaptar-ne el contingut. Ha de ser original teu. Podem no publicar-lo, i
            no hi pot haver res ofensiu.
          </li>
          <li>Jugar és gratuït. Crear un compte també.</li>
          <li>
            Tria un nom d’usuari i noms de lliga respectuosos: els veuen altres persones. Podem
            canviar o esborrar els que siguin ofensius, i tancar els comptes que facin trampes o
            molestin altres jugadors.
          </li>
          <li>
            Fem el possible perquè tot funcioni, però el servei s’ofereix tal com és: pot tenir
            errors o aturades, i les puntuacions es poden recalcular si en detectem algun.
          </li>
          <li>
            Si canviem aquestes condicions, actualitzarem la data de dalt; si el canvi és important,
            ho avisarem a la web.
          </li>
        </ul>
        <p>
          Per a qualsevol dubte, escriu-nos a {mail}. També pots llegir{' '}
          <Link to="/sobre">qui som</Link>.
        </p>
      </Prose>
    </article>
  );
}
