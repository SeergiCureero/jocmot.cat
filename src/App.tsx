import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Layout from './components/layout/Layout';
import Spinner from './components/ui/Spinner';
import { GAMES } from './games/registry';
import GameRoute from './games/GameRoute';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProfilePage from './features/auth/ProfilePage';

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

          <Route path="compte">
            <Route index element={<ProfilePage />} />
            <Route path="entrar" element={<LoginPage />} />
            <Route path="registre" element={<RegisterPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
