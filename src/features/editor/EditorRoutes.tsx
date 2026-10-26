import { Link, Navigate, Route, Routes } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import DraftPage from './DraftPage';
import EditorHome from './EditorHome';
import PuzzlePage from './PuzzlePage';

/** /editor/* — només per a editors. Es carrega a part (code splitting). */
export default function EditorRoutes() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/compte/entrar" replace />;
  if (!user.editor) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold">Encara no ets editor</h1>
        <p className="text-stone-600">
          Demana a l’administrador de jocmot.cat que t’activi el rol d’editor. Després, torna a
          entrar.
        </p>
        <Link to="/" className="text-brand-700 mt-6 inline-block font-semibold hover:underline">
          Torna a l’inici
        </Link>
      </div>
    );
  }
  return (
    <Routes>
      <Route index element={<EditorHome />} />
      <Route path="esborrany/:id" element={<DraftPage />} />
      <Route path="puzle/:id" element={<PuzzlePage />} />
      <Route path="*" element={<Navigate to="/editor" replace />} />
    </Routes>
  );
}
