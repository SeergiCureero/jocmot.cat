import { useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { INPUT } from '@/components/ui/styles';
import { useToast } from '@/components/ui/Toast';
import { backend } from '@/services/backend';
import { useAuth } from './AuthContext';

/** Esborrar el compte amb totes les dades (RGPD). Demana la contrasenya per confirmar-ho. */
export default function DeleteAccount({ onDeleted }: { onDeleted: () => void }) {
  const { logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setPassword('');
    setError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await backend.call('/compte', { method: 'DELETE', body: { password } });
      onDeleted();
      logout();
      toast('Hem esborrat el teu compte. Fins aviat!');
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="mt-12 border-t border-stone-200 pt-6">
      <h2 className="font-semibold">Esborra el compte</h2>
      <p className="mt-1 mb-3 text-sm text-stone-600">
        S’esborraran el compte, les partides, els punts, els amics i les lligues. No es pot desfer.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      >
        Esborra el meu compte
      </button>

      <Modal open={open} onClose={close} title="Segur que vols esborrar el compte?">
        <form onSubmit={submit} className="space-y-3">
          <p>
            Perdràs el progrés, la ratxa, els punts i el rang. Les lligues que hagis creat passaran
            a un altre membre. Per confirmar-ho, escriu la contrasenya.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-label="Contrasenya"
            placeholder="Contrasenya"
            className={INPUT}
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-red-800">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel·la
            </Button>
            <button
              type="submit"
              disabled={!password || busy}
              className="rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:bg-stone-300"
            >
              {busy ? 'Esborrant…' : 'Esborra-ho tot'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
