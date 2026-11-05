import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Layout from './components/layout/Layout';
import Spinner from './components/ui/Spinner';
import { FEATURES } from './config/site';
import { GAMES } from './games/registry';
import GameRoute from './games/GameRoute';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./features/auth/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const NewPasswordPage = lazy(() => import('./features/auth/NewPasswordPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HowToPlayPage = lazy(() => import('./pages/HowToPlayPage'));
const EditorRoutes = lazy(() => import('./features/editor/EditorRoutes'));
const LeaguesPage = lazy(() => import('./features/social/LeaguesPage'));
const LeaguePage = lazy(() => import('./features/social/LeaguePage'));
const JoinLeaguePage = lazy(() => import('./features/social/JoinLeaguePage'));
const FriendsPage = lazy(() => import('./features/social/FriendsPage'));

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
          <Route path="estadistiques" element={<StatsPage />} />
          <Route path="configuracio" element={<SettingsPage />} />
          <Route path="com-es-juga" element={<HowToPlayPage />} />
          <Route path="sobre" element={<AboutPage />} />
          <Route path="legal" element={<LegalPage />} />

          {FEATURES.accounts && (
            <Route path="compte">
              <Route index element={<ProfilePage />} />
              <Route path="entrar" element={<LoginPage />} />
              <Route path="registre" element={<RegisterPage />} />
              <Route path="recupera" element={<ForgotPasswordPage />} />
              <Route path="nova-contrasenya/:token" element={<NewPasswordPage />} />
            </Route>
          )}
          {FEATURES.social && (
            <>
              <Route path="lligues" element={<LeaguesPage />} />
              <Route path="lligues/unir/:code" element={<JoinLeaguePage />} />
              <Route path="lligues/:id" element={<LeaguePage />} />
              <Route path="amics" element={<FriendsPage />} />
            </>
          )}
          {FEATURES.accounts && <Route path="editor/*" element={<EditorRoutes />} />}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
