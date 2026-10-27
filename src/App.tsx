import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Layout from './components/layout/Layout';
import Spinner from './components/ui/Spinner';
import { FEATURES } from './config/site';
import { GAMES } from './games/registry';
import GameRoute from './games/GameRoute';
import ArchivePage from './pages/ArchivePage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProfilePage from './features/auth/ProfilePage';

const EditorRoutes = lazy(() => import('./features/editor/EditorRoutes'));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Cada joc té la seva ruta: /joc (avui) i /joc/:puzzleId (arxiu) */}
          {GAMES.map((game) => (
            <Route key={game.id} path={game.slug}>
              <Route index element={<GameRoute game={game} />} />
              <Route path=":puzzleId" element={<GameRoute game={game} />} />
            </Route>
          ))}

          {FEATURES.archive && <Route path="arxiu" element={<ArchivePage />} />}

          {FEATURES.accounts && (
            <Route path="compte">
              <Route index element={<ProfilePage />} />
              <Route path="entrar" element={<LoginPage />} />
              <Route path="registre" element={<RegisterPage />} />
            </Route>
          )}
          {FEATURES.accounts && <Route path="editor/*" element={<EditorRoutes />} />}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
