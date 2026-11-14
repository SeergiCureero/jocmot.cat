import { useState } from 'react';
import { ColorIcon } from '@/components/icons/color';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { backend } from '@/services/backend';

/** Opció del perfil: sortir (o no) a la lliga mundial. */
export default function WorldLeagueSetting() {
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const on = user?.worldLeague === 'yes';

  async function change(value: boolean) {
    setBusy(true);
    try {
      await backend.setWorldLeague(value ? 'yes' : 'no');
      toast(value ? 'Ja surts a la lliga mundial' : 'Ja no surts a la lliga mundial');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-4">
      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={on}
          disabled={busy}
          onChange={(e) => change(e.target.checked)}
          className="accent-brand-700 mt-1 size-5 shrink-0"
        />
        <span>
          <span className="block font-semibold">
            <ColorIcon name="globe" size={20} className="inline-block align-[-0.2em]" /> Surt a la
            lliga mundial
          </span>
          <span className="block text-sm text-stone-600">
            El teu nom d’usuari i els teus punts del mes seran visibles per a tothom.
          </span>
        </span>
      </label>
    </section>
  );
}
