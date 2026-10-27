/** Rangs per punts totals. Han de coincidir amb `backend/pb_hooks/jocmot.js` (ho comprova un test). */
export const RANKS = [
  { name: 'Aprenent', icon: '🌱', min: 0 },
  { name: 'Lletraferit', icon: '📖', min: 150 },
  { name: 'Paraulaire', icon: '✒️', min: 500 },
  { name: 'Erudit', icon: '🎓', min: 1200 },
  { name: 'Mestre de mots', icon: '🏛️', min: 2500 },
  { name: 'Gran Mestre', icon: '👑', min: 5000 },
];

/** Explicació de com es guanyen els punts i quins rangs hi ha. */
export default function PointsHelp() {
  return (
    <details className="group mt-10 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
      <summary className="cursor-pointer font-semibold text-stone-900 select-none">
        Com funcionen els punts?
      </summary>
      <div className="mt-3 space-y-3">
        <p>Cada joc del dia dona fins a 15 punts, segons com el resolguis:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Paraula:</strong> 15 en 1 intent, 12 en 2, 10 en 3, 8 en 4, 6 en 5 i 5 en 6.
          </li>
          <li>
            <strong>Connexions:</strong> 15 sense errors i 3 menys per cada error.
          </li>
          <li>
            <strong>Fils:</strong> 15 sense pistes i 3 menys per cada pista (mínim 5).
          </li>
          <li>
            <strong>Mini:</strong> 15 en menys d’1 minut, 12 en menys de 2, 10 en menys de 4 i 8
            després. Si la reveles, 0.
          </li>
        </ul>
        <p>
          🔥 <strong>Ratxa:</strong> cada dia seguit que acabes algun joc del dia suma +1 punt a
          cada joc, fins a +5.
        </p>
        <p>
          📅 <strong>Arxiu:</strong> els puzles de dies anteriors donen la meitat de punts i no
          compten per a la ratxa.
        </p>
        <p>
          🏆 <strong>Lligues:</strong> cada mes comença de zero. Qui en sumi més a final de mes
          guanya la lliga.
        </p>
        <div>
          <p className="mb-1">
            <strong>Rangs</strong> (segons els punts de sempre):
          </p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {RANKS.map((r) => (
              <li key={r.name}>
                {r.icon} {r.name} <span className="text-stone-500">· des de {r.min}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
