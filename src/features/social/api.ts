import { storage } from '@/lib/storage';
import { backend } from '@/services/backend';

/** Tipus i crides de punts, amics i lligues. Els calcula el servidor (backend/pb_hooks/jocmot.pb.js). */

export interface Person {
  id: string;
  name: string;
}

export interface Rank {
  name: string;
  icon: string;
  min: number;
  next: { name: string; icon: string; min: number } | null;
}

export interface Stats {
  total: number;
  monthPoints: number;
  monthGames: number;
  streak: number;
  playedToday: boolean;
  rank: Rank;
}

export interface Profile extends Stats {
  user: Person;
  month: string;
}

export interface RankingRow extends Stats {
  user: Person;
  position: number;
}

export interface FriendRequest {
  id: string;
  user: Person;
}

export interface UserMatch extends Person {
  /** Relació amb qui cerca. */
  relation: 'friend' | 'sent' | 'received' | null;
}

export interface Friends {
  month: string;
  ranking: RankingRow[];
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

export interface LeagueSummary {
  id: string;
  name: string;
  code: string;
  members: number;
  position: number | null;
  leader: Person | null;
  lastMessage: ChatMessage | null;
}

export interface ChatMessage {
  id: string;
  user: Person;
  text: string;
  /** ISO 8601 */
  created: string;
}

export interface Likes {
  count: number;
  liked: boolean;
}

export interface League {
  id: string;
  name: string;
  code: string;
  isOwner: boolean;
  month: string;
  months: string[];
  finished: boolean;
  winner: Person | null;
  ranking: RankingRow[];
}

export interface Score {
  daily: boolean;
  base: number;
  bonus: number;
  points: number;
  streak: number;
}

export const social = {
  profile: () => backend.call<Profile>('/perfil'),
  score: (game: string, puzzle: number) => backend.call<Score>(`/puntuacio/${game}/${puzzle}`),

  friends: () => backend.call<Friends>('/amics'),
  searchUsers: (q: string) =>
    backend.call<{ users: UserMatch[] }>(`/usuaris?q=${encodeURIComponent(q)}`),
  addFriend: (username: string) =>
    backend.call<{ status: 'pending' | 'accepted' }>('/amics', {
      method: 'POST',
      body: { username },
    }),
  acceptFriend: (requestId: string) =>
    backend.call(`/amics/${requestId}/accepta`, { method: 'POST' }),
  /** Rebutja o cancel·la una sol·licitud. */
  removeRequest: (requestId: string) => backend.call(`/amics/${requestId}`, { method: 'DELETE' }),
  removeFriend: (userId: string) => backend.call(`/amics/usuari/${userId}`, { method: 'DELETE' }),

  leagues: () => backend.call<{ month: string; leagues: LeagueSummary[] }>('/lligues'),
  league: (id: string, month?: string) =>
    backend.call<League>(`/lligues/${id}${month ? `?mes=${month}` : ''}`),
  createLeague: (name: string) =>
    backend.call<{ id: string; code: string }>('/lligues', { method: 'POST', body: { name } }),
  joinLeague: (code: string) =>
    backend.call<{ id: string }>('/lligues/unir', { method: 'POST', body: { code } }),
  leaveLeague: (id: string) => backend.call(`/lligues/${id}/membre`, { method: 'DELETE' }),

  /** Missatges del xat; amb `after`, només els posteriors. */
  chat: (leagueId: string, after?: string) =>
    backend.call<{ messages: ChatMessage[] }>(
      `/lligues/${leagueId}/xat${after ? `?despres=${encodeURIComponent(after)}` : ''}`,
    ),
  sendMessage: (leagueId: string, text: string) =>
    backend.call<ChatMessage>(`/lligues/${leagueId}/xat`, { method: 'POST', body: { text } }),
  deleteMessage: (leagueId: string, messageId: string) =>
    backend.call(`/lligues/${leagueId}/xat/${messageId}`, { method: 'DELETE' }),

  likes: (game: string, puzzle: number) => backend.call<Likes>(`/likes/${game}/${puzzle}`),
  setLike: (game: string, puzzle: number, liked: boolean) =>
    backend.call<Likes>(`/likes/${game}/${puzzle}`, { method: 'POST', body: { liked } }),
};

/** Últim missatge del xat de cada lliga que ja s'ha vist en aquest dispositiu. */
const SEEN_KEY = 'xat-vist';
const seenAll = () => storage.get<Record<string, string>>(SEEN_KEY) ?? {};

export const chatSeen = (leagueId: string): string => seenAll()[leagueId] ?? '';

export function markChatSeen(leagueId: string, created: string) {
  const all = seenAll();
  if ((all[leagueId] ?? '') >= created) return;
  storage.set(SEEN_KEY, { ...all, [leagueId]: created });
}

/** Hi ha missatges d'altres que encara no has vist? */
export const hasUnread = (l: LeagueSummary, meId?: string) =>
  Boolean(
    l.lastMessage && l.lastMessage.user.id !== meId && l.lastMessage.created > chatSeen(l.id),
  );

/** "2026-10" → "octubre del 2026" */
export function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('ca', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(y, m - 1, 15)),
  );
}
