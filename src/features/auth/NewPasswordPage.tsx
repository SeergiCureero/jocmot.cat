import { Link, useNavigate, useParams } from 'react-router';
import { useToast } from '@/components/ui/Toast';
import { backend, BackendError } from '@/services/backend';
import AuthForm from './AuthForm';

/** Enllaç del correu de recuperació: /compte/nova-contrasenya/:token */
export default function NewPasswordPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <AuthForm
      title="Tria una contrasenya nova"
      submitLabel="Desa la contrasenya"
      fields={[
        {
          name: 'password',
          label: 'Contrasenya nova (mín. 8 caràcters)',
          type: 'password',
          autoComplete: 'new-password',
          minLength: 8,
        },
      ]}
      onSubmit={async ({ password }) => {
        try {
          await backend.confirmPasswordReset(token, password);
        } catch (e) {
          if (e instanceof BackendError && e.status === 400)
            throw new Error('L’enllaç ha caducat o ja s’ha fet servir. Demana’n un de nou.');
          throw e;
        }
        toast('Contrasenya canviada! Ja pots entrar.');
        navigate('/compte/entrar');
      }}
      footer={
        <Link to="/compte/recupera" className="text-brand-700 font-semibold hover:underline">
          Demana un enllaç nou
        </Link>
      }
    />
  );
}
