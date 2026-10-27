import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/AuthContext';
import { social } from './api';
import { ErrorBox, RequireLogin } from './ui';

/** Enllaç d'invitació (/lligues/unir/CODI): hi uneix l'usuari i el porta a la lliga. */
export default function JoinLeaguePage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <RequireLogin>
        <Join />
      </RequireLogin>
    </div>
  );
}

function Join() {
  const { code = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    social.joinLeague(code).then(
      ({ id }) => navigate(`/lligues/${id}`, { replace: true }),
      (e: Error) => setError(e.message),
    );
  }, [code, user, navigate]);

  if (!error) return <Spinner />;
  return (
    <div className="space-y-3 text-center">
      <ErrorBox>{error}</ErrorBox>
      <Link to="/lligues" className="text-brand-700 text-sm font-semibold hover:underline">
        Ves a les lligues →
      </Link>
    </div>
  );
}
