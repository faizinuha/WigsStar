import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError, Provider } from "@supabase/supabase-js";
import supabase from "@/lib/supabase.ts";

// --- Helper Functions for Local Storage ---

const ACCOUNTS_STORAGE_KEY = "supabase-multi-accounts";
const ACTIVE_ACCOUNT_ID_KEY = "supabase-active-account-id";

interface StoredAccount {
  session: Session;
  user: User;
}

function getStoredAccounts(): StoredAccount[] {
  const accountsJson = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  return accountsJson ? JSON.parse(accountsJson) : [];
}

function setStoredAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function getActiveAccountId(): string | null {
  return localStorage.getItem(ACTIVE_ACCOUNT_ID_KEY);
}

function setActiveAccountId(userId: string) {
  localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, userId);
}

// --- Auth Context ---

interface AuthContextType {
  user: User | null;
  session: Session | null;
  accounts: StoredAccount[];
  loading: boolean;
  addAccount: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, username?: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  addAccountWithOAuth: (provider: Provider) => Promise<void>;
  signOut: (userIdToSignOut?: string, navigate?: (path: string) => void) => Promise<void>;
  switchAccount: (userId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      setLoading(true);
      const storedAccounts = getStoredAccounts();
      const activeId = getActiveAccountId();
      let activeAccount = storedAccounts.find(acc => acc.user.id === activeId);

      if (!activeAccount && storedAccounts.length > 0) {
        activeAccount = storedAccounts[0];
        setActiveAccountId(activeAccount.user.id);
      }

      if (activeAccount) {
        await supabase.auth.setSession(activeAccount.session);
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();

        if (refreshedSession) {
          setUser(refreshedSession.user);
          setSession(refreshedSession);
          const updatedAccounts = storedAccounts.map(acc => 
            acc.user.id === refreshedSession.user.id ? { ...acc, session: refreshedSession } : acc
          );
          setStoredAccounts(updatedAccounts);
          setAccounts(updatedAccounts);
        } else {
          await signOut(activeAccount.user.id);
        }
      } else {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
      }
      
      setAccounts(getStoredAccounts());
      setLoading(false);
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if ((_event === "SIGNED_IN" || _event === "USER_UPDATED") && session) {
            const newAccount: StoredAccount = { user: session.user, session };
            let isNewLogin = false;

            setAccounts(prevAccounts => {
                const accountExists = prevAccounts.some(acc => acc.user.id === newAccount.user.id);
                if (!accountExists) isNewLogin = true;

                const updatedAccounts = accountExists
                    ? prevAccounts.map(acc => acc.user.id === newAccount.user.id ? newAccount : acc)
                    : [...prevAccounts, newAccount];
                
                setStoredAccounts(updatedAccounts);
                return updatedAccounts;
            });

            setActiveAccountId(session.user.id);
            setUser(session.user);
            setSession(session);

            if (isNewLogin && session.refresh_token) {
                console.log('Invoking log-session function (fire-and-forget)...');
                supabase.functions.invoke('log-session', {
                  body: { refreshToken: session.refresh_token },
                }).then(({ error }) => {
                  if (error) {
                    console.error("Background error invoking log-session:", error);
                  }
                });
            }

        } else if (_event === "TOKEN_REFRESHED" && session) {
            setAccounts(prevAccounts => {
                const updatedAccounts = prevAccounts.map(acc => 
                    acc.user.id === session.user.id ? { ...acc, session } : acc
                );
                setStoredAccounts(updatedAccounts);
                return updatedAccounts;
            });
            setSession(session);
        } else if (_event === "SIGNED_OUT") {
            // Handled in signOut function
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const addAccount = async (email: string, password: string) => {
    await supabase.auth.signOut(); 
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        const activeId = getActiveAccountId();
        const accounts = getStoredAccounts();
        const activeAccount = accounts.find(acc => acc.user.id === activeId);
        if (activeAccount) {
            await supabase.auth.setSession(activeAccount.session);
        }
    }
    return { error };
  };

  const signUp = async (email: string, password: string, username?: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { username, display_name: displayName },
      }
    });
    return { error };
  };

  const addAccountWithOAuth = async (provider: Provider) => {
    await supabase.auth.signOut();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async (userIdToSignOut?: string, navigate?: (path: string) => void) => {
    const accounts = getStoredAccounts();
    const activeId = getActiveAccountId();

    if (userIdToSignOut && accounts.some(acc => acc.user.id === userIdToSignOut)) {
      const updatedAccounts = accounts.filter(acc => acc.user.id !== userIdToSignOut);
      setStoredAccounts(updatedAccounts);
      setAccounts(updatedAccounts);

      if (activeId === userIdToSignOut) {
        setUser(null);
        setSession(null);
        localStorage.removeItem(ACTIVE_ACCOUNT_ID_KEY);
        await supabase.auth.signOut();
      }
    } else {
      setUser(null);
      setSession(null);
      localStorage.removeItem(ACTIVE_ACCOUNT_ID_KEY);
      await supabase.auth.signOut();

      if (navigate) {
        navigate('/auth');
      } else {
        window.location.href = '/auth';
      }
    }
  };

  const switchAccount = async (userId: string) => {
    const accounts = getStoredAccounts();
    const targetAccount = accounts.find(acc => acc.user.id === userId);

    if (targetAccount) {
        setLoading(true);
        setActiveAccountId(userId);
        await supabase.auth.setSession(targetAccount.session);
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();

        if (refreshedSession) {
            setUser(refreshedSession.user);
            setSession(refreshedSession);
            const updatedAccounts = accounts.map(acc => 
                acc.user.id === refreshedSession.user.id ? { ...acc, session: refreshedSession } : acc
            );
            setStoredAccounts(updatedAccounts);
            setAccounts(updatedAccounts);
        } else {
            await signOut(userId);
        }
        setLoading(false);
    }
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error };
  };

  const value = { user, session, accounts, loading, addAccount, signUp, addAccountWithOAuth, signOut, switchAccount, resetPassword };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
