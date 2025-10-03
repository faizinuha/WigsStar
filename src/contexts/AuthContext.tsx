import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { User, Session, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

// --- Helper Functions for Local Storage ---

const ACCOUNTS_STORAGE_KEY = 'supabase-multi-accounts';
const ACTIVE_ACCOUNT_ID_KEY = 'supabase-active-account-id';

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

// --- Internal Profile Updater Component ---

const ProfileSync = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { mutate: updateProfile } = useUpdateProfile();

  useEffect(() => {
    if (!user || !profile) return;
    
    const provider = user.app_metadata.provider;
    const rawMetaData = user.user_metadata as any;

    let updates: Partial<{ display_name: string; username?: string; avatar_url?: string }> = {};

    // Auto-fill from Google
    if (provider === 'google') {
      if (!profile.display_name && rawMetaData?.full_name) {
        updates.display_name = rawMetaData.full_name;
      }
      if (!profile.username && rawMetaData?.email) {
        updates.username = rawMetaData.email.split('@')[0];
      }
      if (!profile.avatar_url && rawMetaData?.avatar_url) {
        updates.avatar_url = rawMetaData.avatar_url;
      }
    }
    
    // Auto-fill from GitHub
    else if (provider === 'github') {
      if (!profile.display_name && rawMetaData?.name) {
        updates.display_name = rawMetaData.name;
      }
      if (!profile.username && rawMetaData?.user_name) {
        updates.username = rawMetaData.user_name;
      }
      if (!profile.avatar_url && rawMetaData?.avatar_url) {
        updates.avatar_url = rawMetaData.avatar_url;
      }
    }

    // Auto-fill from Discord
    else if (provider === 'discord') {
      if (!profile.display_name && rawMetaData?.full_name) {
        updates.display_name = rawMetaData.full_name;
      }
      if (!profile.username && rawMetaData?.name) {
        updates.username = rawMetaData.name;
      }
      if (!profile.avatar_url && rawMetaData?.avatar_url) {
        updates.avatar_url = rawMetaData.avatar_url;
      }
    }

    if (Object.keys(updates).length > 0) {
      updateProfile(updates);
    }
  }, [user, profile, updateProfile]);

  return null;
};


// --- Auth Context ---

interface AuthContextType {
  user: User | null;
  session: Session | null;
  accounts: StoredAccount[];
  loading: boolean;
  provider: string | null;
  addAccount: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    username?: string,
    displayName?: string
  ) => Promise<{ error: AuthError | null }>;
  addAccountWithOAuth: (provider: Provider) => Promise<void>;
  signOut: (
    userIdToSignOut?: string,
    navigate?: (path: string) => void
  ) => Promise<void>;
  switchAccount: (userId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
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
  const [provider, setProvider] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    async function initializeAuth() {
      try {
        const storedAccounts = getStoredAccounts();
        const activeId = getActiveAccountId();
        const activeAccount = storedAccounts.find(
          (acc) => acc.user.id === activeId
        );

        if (!isMounted) return;

        if (activeAccount) {
          const { error } = await supabase.auth.setSession(activeAccount.session);
          if (!error && isMounted) {
            setUser(activeAccount.user);
            setSession(activeAccount.session);
            setProvider(activeAccount.user.app_metadata.provider || null);
          }
        } else if (storedAccounts.length > 0) {
          const defaultAccount = storedAccounts[0];
          setActiveAccountId(defaultAccount.user.id);
          const { error } = await supabase.auth.setSession(defaultAccount.session);
          if (!error && isMounted) {
            setUser(defaultAccount.user);
            setSession(defaultAccount.session);
            setProvider(defaultAccount.user.app_metadata.provider || null);
          }
        } else {
          // No accounts, check current session
          const { data: { session } } = await supabase.auth.getSession();
          if (session && isMounted) {
            setUser(session.user);
            setSession(session);
            setProvider(session.user.app_metadata.provider || null);
          }
        }
        
        if (isMounted) {
          setAccounts(storedAccounts);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        if (isMounted) {
          localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
          localStorage.removeItem(ACTIVE_ACCOUNT_ID_KEY);
          setUser(null);
          setSession(null);
          setAccounts([]);
          setProvider(null);
        }
      } finally {
        if (isMounted) {
          // Ensure minimum 1 second loading like Instagram
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 1000 - elapsed);
          
          setTimeout(() => {
            if (isMounted) {
              setLoading(false);
            }
          }, remaining);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if ((_event === 'SIGNED_IN' || _event === 'USER_UPDATED') && session) {
        const newAccount: StoredAccount = { user: session.user, session };
        let isNewLogin = false;

        setAccounts((prevAccounts) => {
          const accountExists = prevAccounts.some(
            (acc) => acc.user.id === newAccount.user.id
          );
          if (!accountExists) isNewLogin = true;

          const updatedAccounts = accountExists
            ? prevAccounts.map((acc) =>
                acc.user.id === newAccount.user.id ? newAccount : acc
              )
            : [...prevAccounts, newAccount];

          setStoredAccounts(updatedAccounts);
          return updatedAccounts;
        });

        setActiveAccountId(session.user.id);
        setUser(session.user);
        setSession(session);
        setProvider((session.user.app_metadata.provider as string) || null);

        if (isNewLogin) {
          const { user } = session;
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error checking for profile:', profileError);
          } else if (!profile) {
            // Profile doesn't exist, let's create it
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                username:
                  user.user_metadata.user_name || user.email?.split('@')[0],
                display_name:
                  user.user_metadata.full_name || user.user_metadata.name,
                avatar_url: user.user_metadata.avatar_url,
              });
            if (insertError) {
              console.error('Error creating profile:', insertError);
            }
          }
        }

        if (isNewLogin && session.refresh_token) {
          console.log('Invoking log-session function (fire-and-forget)...');
          supabase.functions
            .invoke('log-session', {
              body: {
                user_id: session.user.id,
                event: 'login',
                timestamp: new Date().toISOString(),
              },
            })
            .then(({ error }) => {
              if (error) {
                console.error('Background error invoking log-session:', error);
              }
            });
        }
      } else if (_event === 'TOKEN_REFRESHED' && session) {
        setAccounts((prevAccounts) => {
          const updatedAccounts = prevAccounts.map((acc) =>
            acc.user.id === session.user.id ? { ...acc, session } : acc
          );
          setStoredAccounts(updatedAccounts);
          return updatedAccounts;
        });
        setSession(session);
      } else if (_event === 'SIGNED_OUT') {
        // Handled in signOut function
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addAccount = async (email: string, password: string) => {
    await supabase.auth.signOut();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const activeId = getActiveAccountId();
      const accounts = getStoredAccounts();
      const activeAccount = accounts.find((acc) => acc.user.id === activeId);
      if (activeAccount) {
        await supabase.auth.setSession(activeAccount.session);
      }
    }
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    username?: string,
    displayName?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { username, display_name: displayName },
      },
    });
    return { error };
  };

  const addAccountWithOAuth = async (provider: Provider) => {
    await supabase.auth.signOut();

    const options: { redirectTo: string; scopes?: string } = {
      redirectTo: window.location.origin,
    };

    if (provider === 'spotify') {
      options.scopes = 'playlist-read-private';
    }

    await supabase.auth.signInWithOAuth({
      provider,
      options,
    });
  };

  const signOut = async (
    userIdToSignOut?: string,
    navigate?: (path: string) => void
  ) => {
    const accounts = getStoredAccounts();
    const activeId = getActiveAccountId();

    if (
      userIdToSignOut &&
      accounts.some((acc) => acc.user.id === userIdToSignOut)
    ) {
      const updatedAccounts = accounts.filter(
        (acc) => acc.user.id !== userIdToSignOut
      );
      setStoredAccounts(updatedAccounts);
      setAccounts(updatedAccounts);

      if (activeId === userIdToSignOut) {
        setUser(null);
        setSession(null);
        setProvider(null);
        localStorage.removeItem(ACTIVE_ACCOUNT_ID_KEY);
        await supabase.auth.signOut();
      }
    } else {
      setUser(null);
      setSession(null);
      setProvider(null);
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
    const targetAccount = accounts.find((acc) => acc.user.id === userId);

    if (targetAccount) {
      try {
        setActiveAccountId(userId);
        const { error } = await supabase.auth.setSession(targetAccount.session);
        if (error) {
          console.error('Failed to switch session:', error);
          throw error;
        }
        setUser(targetAccount.user);
        setSession(targetAccount.session);
        setProvider((targetAccount.user.app_metadata.provider as string) || null);
      } catch (error) {
        console.error('Error switching account:', error);
      }
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    accounts,
    loading,
    provider,
    addAccount,
    signUp,
    addAccountWithOAuth,
    signOut,
    switchAccount,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-screen gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <>
          {children}
          <ProfileSync />
        </>
      )}
    </AuthContext.Provider>
  );
}
