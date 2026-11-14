import { useAuth } from '@/features/auth/AuthContext';
import { ALL_GAMES, GAMES } from './registry';

/** Els jocs que veu qui mira: els públics i, si és editor, també els que encara són en proves. */
export function useGames() {
  const { user } = useAuth();
  return user?.editor ? ALL_GAMES : GAMES;
}
