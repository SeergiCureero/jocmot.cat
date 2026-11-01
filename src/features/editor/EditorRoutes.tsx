import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import CalendarPage from './CalendarPage';
import DraftPage from './DraftPage';
import EditorHome from './EditorHome';
import PuzzlePage from './PuzzlePage';

/**
 * /editor/* — qualsevol persona amb compte hi pot dissenyar i proposar puzles; els editors
 * (camp `editor`) els revisen, els aproven i els programen. Es carrega a part (code splitting).
 */
export default function EditorRoutes() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/compte/entrar" replace />;
  return (
    <Routes>
      <Route index element={<EditorHome />} />
      <Route path="esborrany/:id" element={<DraftPage />} />
      <Route path="puzle/:id" element={<PuzzlePage />} />
      {user.editor && <Route path="calendari" element={<CalendarPage />} />}
      <Route path="*" element={<Navigate to="/editor" replace />} />
    </Routes>
  );
}
