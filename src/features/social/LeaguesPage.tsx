import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { INPUT } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { formatMonth, social } from './api';
import PointsHelp from './PointsHelp';
import { ErrorBox, RequireLogin, SocialTabs, useLoad } from './ui';
import Icon from '@/components/ui/Icon';

/** Les meves lligues + crear-ne una o unir-s'hi amb un codi. */
export default function LeaguesPage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-1 text-2xl font-bold">Competició</h1>
      <p className="mb-5 text-sm text-stone-600">
        Cada mes comença una lliga nova: qui sumi més punts fins a final de mes, guanya.
      </p>
      <SocialTabs />
      <RequireLogin>
        <Leagues />
      </RequireLogin>
      <PointsHelp />
    </div>
  );
}

function Leagues() {
  const { data, error } = useLoad(() => social.leagues(), []);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data) return <Spinner />;

  return (
    <>
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">
          Les teves lligues{' '}
          <span className="text-sm font-normal text-stone-500">· {formatMonth(data.month)}</span>
        </h2>
        {data.leagues.length ? (
          <ul className="grid gap-3">
            {data.leagues.map((l, i) => (
              <li key={l.id} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                <Link
                  to={`/lligues/${l.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-100 text-2xl">
                    <Icon name="trofeu" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{l.name}</span>
                    <span className="block text-sm text-stone-600">
                      {l.members} {l.members === 1 ? 'membre' : 'membres'}
                      {l.leader && <> · Lidera {l.leader.name}</>}
                    </span>
                  </span>
                  {l.position && (
                    <span className="text-right">
                      <span className="block text-xl font-bold tabular-nums">{l.position}a</span>
                      <span className="block text-xs text-stone-500">posició</span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-600">
            Encara no ets a cap lliga. Crea’n una i passa el codi als teus amics!
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <CreateLeague />
        <JoinLeague />
      </div>
    </>
  );
}

function CreateLeague() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { id } = await social.createLeague(name);
      navigate(`/lligues/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={CARD}>
      <h2 className="font-semibold">Crea una lliga</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        placeholder="p. ex. Els de la colla"
        aria-label="Nom de la lliga"
        className={INPUT}
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      <Button type="submit" disabled={!name.trim() || busy}>
        {busy ? 'Creant…' : 'Crea-la'}
      </Button>
    </form>
  );
}

function JoinLeague() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { id } = await social.joinLeague(code);
      navigate(`/lligues/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={CARD}>
      <h2 className="font-semibold">Uneix-te amb un codi</h2>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        maxLength={6}
        placeholder="ABC123"
        aria-label="Codi de la lliga"
        className={cn(INPUT, 'font-mono tracking-[0.3em] uppercase')}
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      <Button type="submit" variant="secondary" disabled={code.length !== 6 || busy}>
        {busy ? 'Entrant…' : 'Uneix-t’hi'}
      </Button>
    </form>
  );
}

const CARD = 'flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4';
