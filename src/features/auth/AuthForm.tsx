import { useState, type FormEvent, type ReactNode } from 'react';
import Button from '@/components/ui/Button';

export interface Field {
  name: string;
  label: string;
  type: 'email' | 'password' | 'text';
  autoComplete: string;
  minLength?: number;
}

interface Props {
  title: string;
  fields: Field[];
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  footer?: ReactNode;
}

/** Formulari genèric per a entrar/registrar-se. */
export default function AuthForm({ title, fields, submitLabel, onSubmit, footer }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values = Object.fromEntries(fields.map((f) => [f.name, String(data.get(f.name) ?? '')]));
    setError(null);
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hi ha hagut un error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm py-10">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">{f.label}</span>
            <input
              name={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              minLength={f.minLength}
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </label>
        ))}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Un moment…' : submitLabel}
        </Button>
      </form>
      {footer && <div className="mt-6 text-center text-sm text-stone-600">{footer}</div>}
    </div>
  );
}
