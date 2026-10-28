import { useState } from 'react';
import { Link } from 'react-router';
import { backend } from '@/services/backend';
import AuthForm from './AuthForm';
import Icon from '@/components/ui/Icon';

/** Demana el correu per canviar la contrasenya. */
export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo) {
    return (
      <div className="animate-rise mx-auto w-full max-w-sm py-10 text-center">
        <Icon name="correu" className="size-12" />
        <h1 className="mt-2 text-2xl font-bold">Mira el correu</h1>
        <p className="mt-2 text-sm text-stone-600">
          Si <strong>{sentTo}</strong> té un compte, hi trobaràs un enllaç per triar una contrasenya
          nova. Si no t’arriba en uns minuts, mira la carpeta de correu brossa.
        </p>
        <Link
          to="/compte/entrar"
          className="text-brand-700 mt-6 inline-block text-sm font-semibold hover:underline"
        >
          ← Torna a entrar
        </Link>
      </div>
    );
  }

  return (
    <AuthForm
      title="Has oblidat la contrasenya?"
      submitLabel="Envia’m l’enllaç"
      fields={[{ name: 'email', label: 'Correu electrònic', type: 'email', autoComplete: 'email' }]}
      onSubmit={async ({ email }) => {
        await backend.requestPasswordReset(email);
        setSentTo(email);
      }}
      footer={
        <Link to="/compte/entrar" className="text-brand-700 font-semibold hover:underline">
          ← Torna a entrar
        </Link>
      }
    />
  );
}
