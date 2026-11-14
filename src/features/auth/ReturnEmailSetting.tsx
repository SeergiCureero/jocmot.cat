import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { backend } from '@/services/backend';
import { useAuth } from './AuthContext';

/** Opció del perfil: rebre (o no) un correu quan fa dies que no hi jugues. */
export default function ReturnEmailSetting() {
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function change(on: boolean) {
    setBusy(true);
    try {
      await backend.setReturnEmail(on);
      toast(on ? 'T’avisarem per correu' : 'No t’enviarem aquest correu');
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={user?.returnEmail ?? true}
          disabled={busy}
          onChange={(e) => change(e.target.checked)}
          className="accent-brand-700 mt-1 size-5 shrink-0"
        />
        <span>
          <span className="block font-semibold">Un correu si fa dies que no hi jugues</span>
          <span className="block text-sm text-stone-600">
            Només un cop, quan fa 5 dies que no et veiem. Et recordem els puzles i l’Empenta de
            bentornats.
          </span>
        </span>
      </label>
    </section>
  );
}
