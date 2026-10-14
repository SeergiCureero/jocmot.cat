import { Outlet } from 'react-router';
import Footer from './Footer';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
