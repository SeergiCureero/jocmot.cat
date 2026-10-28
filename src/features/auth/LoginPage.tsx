import { Link, useNavigate } from 'react-router';
import AuthForm from './AuthForm';
import { useNextPath } from './next';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { next, query } = useNextPath();

  return (
    <AuthForm
      title="Entra al teu compte"
      submitLabel="Entra"
      fields={[
        { name: 'email', label: 'Correu electrònic', type: 'email', autoComplete: 'email' },
        {
          name: 'password',
          label: 'Contrasenya',
          type: 'password',
          autoComplete: 'current-password',
        },
      ]}
      onSubmit={async ({ email, password }) => {
        await login(email, password);
        navigate(next);
      }}
      footer={
        <>
          No tens compte?{' '}
          <Link
            to={`/compte/registre${query}`}
            className="text-brand-700 font-semibold hover:underline"
          >
            Crea’n un
          </Link>
          <Link
            to="/compte/recupera"
            className="mt-3 block text-stone-500 hover:text-stone-800 hover:underline"
          >
            Has oblidat la contrasenya?
          </Link>
        </>
      }
    />
  );
}
