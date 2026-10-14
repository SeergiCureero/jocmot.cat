import { Link, useNavigate } from 'react-router';
import AuthForm from './AuthForm';
import { useAuth } from './AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <AuthForm
      title="Crea un compte"
      submitLabel="Crea el compte"
      fields={[
        { name: 'username', label: 'Nom d’usuari', type: 'text', autoComplete: 'username' },
        { name: 'email', label: 'Correu electrònic', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Contrasenya (mín. 8 caràcters)', type: 'password', autoComplete: 'new-password', minLength: 8 },
      ]}
      onSubmit={async ({ username, email, password }) => {
        await register({ username, email, password });
        navigate('/');
      }}
      footer={
        <>
          Ja tens compte?{' '}
          <Link to="/compte/entrar" className="font-semibold text-brand-700 hover:underline">
            Entra
          </Link>
        </>
      }
    />
  );
}
