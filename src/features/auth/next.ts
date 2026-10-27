import { useSearchParams } from 'react-router';

/**
 * On s'ha de tornar després d'entrar o registrar-se (?seguent=/lligues/unir/ABC123).
 * Només camins interns, per no redirigir enlloc de fora.
 */
export function useNextPath(): { next: string; query: string } {
  const [params] = useSearchParams();
  const raw = params.get('seguent') ?? '';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  return { next, query: next === '/' ? '' : `?seguent=${encodeURIComponent(next)}` };
}
