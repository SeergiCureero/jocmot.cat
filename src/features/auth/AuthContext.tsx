import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { backend, type RegisterInput, type User } from '@/services/backend';

interface AuthContextValue {
  user: User | null;
  /** 'local' = comptes simulats al navegador (desenvolupament). */
  backendKind: typeof backend.kind;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => backend.getCurrentUser());

  useEffect(() => backend.onAuthChange(setUser), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      backendKind: backend.kind,
      login: (email, password) => backend.login(email, password),
      register: (input) => backend.register(input),
      logout: () => backend.logout(),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth s’ha d’usar dins d’<AuthProvider>');
  return ctx;
}
