import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">Pàgina no trobada</h1>
      <Link
        to="/"
        className="text-brand-700 mt-4 inline-flex min-h-11 items-center px-2 font-semibold hover:underline"
      >
        Torna a l’inici
      </Link>
    </div>
  );
}
