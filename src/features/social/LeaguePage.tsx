import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { SITE } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import { formatMonth, social, type League } from './api';
import PointsHelp from './PointsHelp';
import { ErrorBox, RankingTable, RequireLogin, useLoad } from './ui';

/** Classificació d'una lliga per mesos, amb el codi per convidar-hi gent. */
export default function LeaguePage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link to="/lligues" className="text-brand-700 text-sm hover:underline">
        ← Lligues
      </Link>
      <RequireLogin>
        <LeagueView />
      </RequireLogin>
      <PointsHelp />
    </div>
  );
}

function LeagueView() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [month, setMonth] = useState<string>();
  const { data: league, error } = useLoad(() => social.league(id, month), [id, month]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!league) return <Spinner />;

  return (
    <>
      <div className="mt-2 mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">🏆 {league.name}</h1>
          <p className="text-sm text-stone-600">
            {league.ranking.length} {league.ranking.length === 1 ? 'membre' : 'membres'}
          </p>
        </div>
        {league.months.length > 1 && (
          <select
            value={league.month}
            onChange={(e) => setMonth(e.target.value)}
            aria-label="Mes"
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
          >
            {league.months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        )}
      </div>

      {league.finished ? (
        <div className="animate-rise mb-4 rounded-2xl bg-amber-100 p-4 text-center">
          <p className="text-sm font-semibold text-amber-900 uppercase">
            Lliga de {formatMonth(league.month)} acabada
          </p>
          <p className="mt-1 text-lg font-bold">
            {league.winner ? <>👑 Guanyador: {league.winner.name}</> : 'Ningú no hi va sumar punts'}
          </p>
        </div>
      ) : (
        <p className="mb-4 text-sm text-stone-600">
          Lliga de <strong>{formatMonth(league.month)}</strong>. Acaba l’últim dia del mes a
          mitjanit.
        </p>
      )}

      <RankingTable rows={league.ranking} meId={user?.id} />

      <Invite league={league} />
      <Leave league={league} />
    </>
  );
}

function Invite({ league }: { league: League }) {
  const toast = useToast();
  const link = `${SITE.url}/lligues/unir/${league.code}`;
  const text = `Uneix-te a la meva lliga «${league.name}» de ${SITE.name}! Codi: ${league.code}\n${link}`;

  async function share() {
    const touch = matchMedia('(pointer: coarse)').matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* cancel·lat: el copiem */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast('Invitació copiada!');
    } catch {
      toast('No s’ha pogut copiar');
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 text-center">
      <p className="text-sm text-stone-600">Convida-hi amics amb aquest codi</p>
      <p className="my-2 font-mono text-3xl font-bold tracking-[0.3em] select-all">{league.code}</p>
      <Button onClick={share}>Comparteix la invitació</Button>
    </section>
  );
}

function Leave({ league }: { league: League }) {
  const navigate = useNavigate();
  const toast = useToast();

  async function leave() {
    const last = league.ranking.length === 1;
    const question = last
      ? 'Ets l’últim membre: si en surts, la lliga s’esborrarà. Segur?'
      : `Segur que vols sortir de «${league.name}»?`;
    if (!confirm(question)) return;
    try {
      await social.leaveLeague(league.id);
      navigate('/lligues');
    } catch (e) {
      toast((e as Error).message);
    }
  }

  return (
    <p className="mt-4 text-center">
      <button onClick={leave} className="text-sm text-stone-500 hover:text-red-700 hover:underline">
        Surt de la lliga
      </button>
    </p>
  );
}
