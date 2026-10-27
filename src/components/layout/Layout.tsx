import { Outlet, useLocation } from 'react-router';
import Footer from './Footer';
import Header from './Header';

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        {/* Cada pàgina entra amb una petita transició. */}
        <div key={pathname} className="animate-page-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
