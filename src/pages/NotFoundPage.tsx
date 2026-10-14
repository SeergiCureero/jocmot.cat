import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">Pàgina no trobada</h1>
      <Link to="/" className="mt-4 inline-block font-semibold text-brand-700 hover:underline">
        Torna a l’inici
      </Link>
    </div>
  );
}
