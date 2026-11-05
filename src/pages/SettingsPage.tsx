import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { updateSettings, useSettings, type Settings } from '@/features/settings/settings';

/** Configuració del dispositiu: es desa sola i s'aplica a l'instant. */
export default function SettingsPage() {
  const settings = useSettings();
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return (
    <div className="mx-auto max-w-xl py-6">
      <h1 className="mb-1 text-2xl font-bold">Configuració</h1>
      <p className="mb-5 text-sm text-stone-600">Els canvis es desen sols en aquest dispositiu.</p>

      <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        <Toggle
          label="Alt contrast"
          description="Per a daltonisme. A Paraula, encert en taronja i present en blau. A Connexions, cada grup porta un símbol."
          checked={settings.highContrast}
          onChange={(highContrast) => updateSettings({ highContrast })}
        >
          <span className="mt-3 flex gap-1" aria-hidden>
            <span className="bg-correct text-on-correct grid size-8 place-items-center rounded font-bold">
              A
            </span>
            <span className="bg-present text-on-present grid size-8 place-items-center rounded font-bold">
              B
            </span>
            <span className="bg-absent grid size-8 place-items-center rounded font-bold text-white">
              C
            </span>
          </span>
        </Toggle>

        <Toggle
          label="Vibració"
          description={
            canVibrate
              ? 'Una vibració curta quan encertes o falles.'
              : 'Aquest dispositiu no permet vibrar des del navegador.'
          }
          checked={settings.vibration}
          disabled={!canVibrate}
          onChange={(vibration) => {
            updateSettings({ vibration });
            if (vibration) navigator.vibrate?.(30);
          }}
        />

        <MotionChoice value={settings.motion} />
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
  children,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <label htmlFor={id} className="font-semibold">
            {label}
          </label>
          <p id={`${id}-d`} className="text-sm text-stone-600">
            {description}
          </p>
        </div>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={`${id}-d`}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className="group grid min-h-11 min-w-14 shrink-0 place-items-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span
            className={cn(
              'flex h-7 w-12 items-center rounded-full p-0.5 transition-colors',
              checked ? 'bg-brand-700' : 'bg-stone-400',
            )}
          >
            <span
              className={cn(
                'size-6 rounded-full bg-white shadow transition-transform',
                checked && 'translate-x-5',
              )}
            />
          </span>
        </button>
      </div>
      {children}
    </div>
  );
}

const MOTION: { value: Settings['motion']; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'reduce', label: 'Menys' },
  { value: 'full', label: 'Totes' },
];

function MotionChoice({ value }: { value: Settings['motion'] }) {
  return (
    <fieldset className="p-4">
      <legend className="float-left font-semibold">Animacions</legend>
      <p className="clear-left text-sm text-stone-600">
        Per defecte, segueix el que hagis triat al mòbil o a l’ordinador.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-full bg-stone-100 p-1">
        {MOTION.map((m) => (
          <label
            key={m.value}
            className={cn(
              'has-[:focus-visible]:outline-brand-700 flex min-h-11 cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-colors has-[:focus-visible]:outline-3',
              value === m.value ? 'bg-white text-stone-900 shadow' : 'text-stone-600',
            )}
          >
            <input
              type="radio"
              name="motion"
              value={m.value}
              checked={value === m.value}
              onChange={() => updateSettings({ motion: m.value })}
              className="sr-only"
            />
            {m.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
