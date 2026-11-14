import { useState } from 'react';
import { useLocation } from 'react-router';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { FEATURES } from '@/config/site';
import { useAuth } from '@/features/auth/AuthContext';
import { GAMES } from '@/games/registry';
import { backend } from '@/services/backend';

/**
 * Pregunta una vegada (a qui té compte i encara no ha triat) si vol sortir a la lliga mundial.
 * Si tanca la finestra sense triar, torna a sortir la propera vegada que entri.
 * No surt mentre es juga ni a l'editor.
 */
export default function WorldLeagueInvite() {
  const { user } = useAuth();
  const toast = useToast();
  const { pathname } = useLocation();
  const [later, setLater] = useState(false);
  const [busy, setBusy] = useState(false);

  const playing = GAMES.some(
    (g) => pathname === `/${g.slug}` || pathname.startsWith(`/${g.slug}/`),
  );
  const open =
    FEATURES.social &&
    !!user &&
    !user.worldLeague &&
    !later &&
    !playing &&
    !pathname.startsWith('/editor');

  async function choose(choice: 'yes' | 'no') {
    setBusy(true);
    try {
      await backend.setWorldLeague(choice);
      toast(choice === 'yes' ? 'Ja surts a la lliga mundial!' : 'Entesos, no hi sortiràs.');
    } catch (e) {
      toast((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={() => setLater(true)} title="🌍 Ja hi ha lliga mundial!">
      <p>
        Cada mes pots competir amb tots els jugadors de {`jocmot.cat`}: surten els 50 primers i tu
        veus també la teva posició.
      </p>
      <p>
        Per sortir-hi, <strong>el teu nom d’usuari serà visible per a tothom</strong>. Si no ho
        vols, no passa res: pots seguir jugant amb els amics i les teves lligues. Ho pots canviar
        quan vulguis des del perfil.
      </p>
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={() => choose('no')} disabled={busy}>
          No, gràcies
        </Button>
        <Button onClick={() => choose('yes')} disabled={busy}>
          Sí, hi vull sortir
        </Button>
      </div>
    </Modal>
  );
}
