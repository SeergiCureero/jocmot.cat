import { Link, useNavigate } from 'react-router';
import AuthForm from './AuthForm';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Entra al teu compte"
      submitLabel="Entra"
      fields={[
        { name: 'email', label: 'Correu electrònic', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Contrasenya', type: 'password', autoComplete: 'current-password' },
      ]}
      onSubmit={async ({ email, password }) => {
        await login(email, password);
        navigate('/');
      }}
      footer={
        <>
          No tens compte?{' '}
          <Link to="/compte/registre" className="font-semibold text-brand-700 hover:underline">
            Crea’n un
          </Link>
        </>
      }
    />
  );
}
