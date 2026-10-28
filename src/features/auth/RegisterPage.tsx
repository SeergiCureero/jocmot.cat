import { Link, useNavigate } from 'react-router';
import AuthForm from './AuthForm';
import { useNextPath } from './next';
import { useAuth } from './AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { next, query } = useNextPath();

  return (
    <AuthForm
      title="Crea un compte"
      submitLabel="Crea el compte"
      fields={[
        { name: 'username', label: 'Nom d’usuari', type: 'text', autoComplete: 'username' },
        { name: 'email', label: 'Correu electrònic', type: 'email', autoComplete: 'email' },
        {
          name: 'password',
          label: 'Contrasenya (mín. 8 caràcters)',
          type: 'password',
          autoComplete: 'new-password',
          minLength: 8,
        },
      ]}
      onSubmit={async ({ username, email, password }) => {
        await register({ username, email, password });
        navigate(next);
      }}
      footer={
        <>
          <span className="mb-3 block text-xs text-stone-500">
            En crear el compte acceptes les{' '}
            <Link to="/legal#condicions" className="underline hover:text-stone-800">
              condicions d’ús
            </Link>{' '}
            i la{' '}
            <Link to="/legal#privadesa" className="underline hover:text-stone-800">
              política de privadesa
            </Link>
            .
          </span>
          Ja tens compte?{' '}
          <Link
            to={`/compte/entrar${query}`}
            className="text-brand-700 font-semibold hover:underline"
          >
            Entra
          </Link>
        </>
      }
    />
  );
}
