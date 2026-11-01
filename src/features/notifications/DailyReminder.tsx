import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { INPUT } from '@/components/ui/styles';
import { useToast } from '@/components/ui/Toast';
import {
  DEFAULT_HOUR,
  disablePush,
  enabledHour,
  enablePush,
  pushAvailable,
  pushSupport,
  sendTestPush,
} from './push';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // de 7:00 a 23:00

/** Opció del perfil per rebre cada dia un avís quan hi ha puzles nous. */
export default function DailyReminder() {
  const toast = useToast();
  const support = pushSupport();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [chosen, setChosen] = useState(DEFAULT_HOUR);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    pushAvailable().then(async (ok) => {
      setAvailable(ok);
      if (!ok) return;
      const h = await enabledHour();
      setHour(h);
      if (h !== null) setChosen(h);
    });
  }, []);

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await action();
      toast(done);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'No s’ha pogut fer');
    } finally {
      setBusy(false);
    }
  };

  const enable = (h: number) =>
    run(async () => {
      await enablePush(h);
      setHour(h);
    }, `Fet! T’avisarem cada dia a les ${h}:00.`);

  const disable = () =>
    run(async () => {
      await disablePush();
      setHour(null);
    }, 'Avís desactivat');

  const test = () =>
    run(async () => {
      const { sent } = await sendTestPush();
      if (!sent) throw new Error('No s’ha pogut enviar l’avís de prova.');
    }, 'Avís de prova enviat');

  return (
    <section className="mt-8 rounded-xl border border-stone-200 bg-white p-4">
      <h2 className="font-semibold">🔔 Avís diari</h2>
      <p className="mt-1 text-sm text-stone-600">
        Una notificació cada dia quan tinguis puzles nous, per no perdre la ratxa. Si aquell dia ja
        has jugat als quatre jocs, no t’avisem.
      </p>
      <div className="mt-3">
        {support === 'ios-needs-install' ? (
          <p className="text-sm text-stone-600">
            A l’iPhone o l’iPad, primer afegeix jocmot a la pantalla d’inici (botó{' '}
            <strong>Comparteix</strong> → <strong>Afegeix a la pantalla d’inici</strong>) i obre’l
            des d’allà.
          </p>
        ) : support === 'unsupported' ? (
          <p className="text-sm text-stone-600">Aquest navegador no admet notificacions.</p>
        ) : available === null ? (
          <p className="text-sm text-stone-500">Carregant…</p>
        ) : !available ? (
          <p className="text-sm text-stone-600">Ara mateix els avisos no estan disponibles.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              A les
              <select
                className={INPUT.replace('w-full', 'w-auto')}
                value={chosen}
                disabled={busy}
                onChange={(e) => {
                  const h = Number(e.target.value);
                  setChosen(h);
                  if (hour !== null) enable(h);
                }}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}:00
                  </option>
                ))}
              </select>
            </label>
            {hour === null ? (
              <Button disabled={busy} onClick={() => enable(chosen)}>
                Activa l’avís
              </Button>
            ) : (
              <>
                <Button variant="secondary" disabled={busy} onClick={test}>
                  Envia’m una prova
                </Button>
                <Button variant="ghost" disabled={busy} onClick={disable}>
                  Desactiva
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
