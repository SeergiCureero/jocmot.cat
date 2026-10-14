import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type ShowToast = (message: string, durationMs?: number) => void;

const ToastContext = createContext<ShowToast>(() => {});

/** Missatges breus a la part superior ("Massa curta", "Copiat!"...). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback<ShowToast>((msg, durationMs = 1800) => {
    clearTimeout(timer.current);
    setMessage(msg);
    timer.current = setTimeout(() => setMessage(null), durationMs);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center">
        {message && (
          <div className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
