import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { CloseIcon, SendIcon } from '@/components/icons';
import { INPUT } from '@/components/ui/styles';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { markChatSeen, social, type ChatMessage } from './api';

/** Cada quant es miren els missatges nous mentre la pàgina és visible. */
const POLL_MS = 5000;
const MAX_LENGTH = 300;

const time = new Intl.DateTimeFormat('ca', { hour: '2-digit', minute: '2-digit' });
const day = new Intl.DateTimeFormat('ca', { day: 'numeric', month: 'short' });

function when(iso: string) {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today ? time.format(d) : `${day.format(d)}, ${time.format(d)}`;
}

/** Minixat de la lliga: últims missatges, es refresca sol i es pot escriure-hi. */
export default function LeagueChat({
  leagueId,
  meId,
  isOwner,
}: {
  leagueId: string;
  meId: string;
  isOwner: boolean;
}) {
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const stickToBottom = useRef(true);
  const lastRef = useRef<string>('');

  const merge = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const seen = new Set((prev ?? []).map((m) => m.id));
      return [...(prev ?? []), ...incoming.filter((m) => !seen.has(m.id))];
    });
  }, []);

  // Primera càrrega i, després, només els missatges nous mentre la pàgina és visible.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    lastRef.current = '';
    setMessages(null);

    async function poll() {
      if (document.visibilityState === 'visible') {
        try {
          const { messages: incoming } = await social.chat(leagueId, lastRef.current || undefined);
          if (cancelled) return;
          setFailed(false);
          if (lastRef.current) merge(incoming);
          else setMessages(incoming);
        } catch {
          if (!cancelled) setFailed(true);
        }
      }
      if (!cancelled) timer = setTimeout(poll, POLL_MS);
    }
    void poll();
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      clearTimeout(timer);
      void poll();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [leagueId, merge]);

  const last = messages?.at(-1);
  useEffect(() => {
    if (!last) return;
    lastRef.current = last.created;
    markChatSeen(leagueId, last.created);
  }, [last, leagueId]);

  // Si ja eres a baix de tot, els missatges nous et porten a baix.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;
    setSending(true);
    try {
      const message = await social.sendMessage(leagueId, clean);
      stickToBottom.current = true;
      merge([message]);
      setText('');
    } catch (err) {
      toast((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function remove(m: ChatMessage) {
    if (!confirm('Vols esborrar aquest missatge?')) return;
    try {
      await social.deleteMessage(leagueId, m.id);
      setMessages((prev) => prev?.filter((x) => x.id !== m.id) ?? null);
    } catch (err) {
      toast((err as Error).message);
    }
  }

  return (
    <section
      aria-labelledby="xat-titol"
      className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white"
    >
      <h2 id="xat-titol" className="border-b border-stone-100 px-4 py-3 font-semibold">
        💬 Xat de la lliga
      </h2>

      <ol
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        aria-live="polite"
        aria-busy={!messages}
        className="h-72 space-y-2 overflow-y-auto overscroll-contain px-4 py-3"
      >
        {!messages &&
          !failed &&
          [0, 1, 2].map((i) => (
            <li key={i} className="h-10 w-2/3 animate-pulse rounded-2xl bg-stone-100" aria-hidden />
          ))}
        {messages?.length === 0 && (
          <li className="grid h-full place-items-center text-center text-sm text-stone-600">
            Encara no hi ha cap missatge. Digues hola! 👋
          </li>
        )}
        {messages?.map((m, i) => {
          const mine = m.user.id === meId;
          const sameAuthor = messages[i - 1]?.user.id === m.user.id;
          return (
            <li key={m.id} className={cn('group flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[85%]', mine && 'text-right')}>
                {!mine && !sameAuthor && (
                  <p className="mb-0.5 px-1 text-xs font-semibold text-stone-600">{m.user.name}</p>
                )}
                <div className={cn('flex items-center gap-1', mine && 'flex-row-reverse')}>
                  <p
                    className={cn(
                      'rounded-2xl px-3 py-2 text-left text-sm break-words whitespace-pre-line',
                      mine ? 'bg-brand-700 text-white' : 'bg-stone-100 text-stone-900',
                    )}
                  >
                    {m.text}
                    <span
                      className={cn(
                        'ml-2 align-bottom text-[11px] tabular-nums',
                        mine ? 'text-white/85' : 'text-stone-600',
                      )}
                    >
                      {when(m.created)}
                    </span>
                  </p>
                  {(mine || isOwner) && (
                    <button
                      type="button"
                      onClick={() => remove(m)}
                      aria-label="Esborra el missatge"
                      className="grid size-11 shrink-0 place-items-center rounded-full text-stone-500 opacity-0 transition group-hover:opacity-100 hover:bg-stone-100 hover:text-red-700 focus-visible:opacity-100 [@media(pointer:coarse)]:opacity-100"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {failed && (
        <p className="px-4 pb-2 text-sm text-red-800" role="alert">
          No es pot carregar el xat. Ho tornem a provar…
        </p>
      )}

      <form onSubmit={send} className="flex gap-2 border-t border-stone-100 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="Escriu un missatge…"
          aria-label="Missatge per a la lliga"
          enterKeyHint="send"
          className={INPUT}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Envia"
          className="bg-brand-700 hover:bg-brand-900 grid size-11 shrink-0 place-items-center rounded-full text-white transition enabled:active:scale-95 disabled:bg-stone-300"
        >
          <SendIcon className="size-5" />
        </button>
      </form>
    </section>
  );
}
