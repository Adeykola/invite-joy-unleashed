
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'admin' | 'host' | 'user';
  created_at: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Handle profile fetching and routing
      if (newSession?.user?.id) {
        setTimeout(async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
              
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching profile:', error);
              setProfile(null);
            } else {
              setProfile(data);
              
              // Handle automatic redirection after login
              if (event === 'SIGNED_IN' && data?.role) {
                console.log('Redirecting user with role:', data.role);
                const currentPath = window.location.pathname;
                
                // Don't redirect if already on correct dashboard or public pages
                if (!currentPath.includes('dashboard') && 
                    currentPath !== '/' && 
                    currentPath !== '/login' && 
                    currentPath !== '/signup') {
                  return;
                }
                
                // Redirect based on role
                switch (data.role) {
                  case 'admin':
                    navigate('/admin-dashboard', { replace: true });
                    break;
                  case 'host':
                    navigate('/host-dashboard', { replace: true });
                    break;
                  case 'user':
                  default:
                    navigate('/user-dashboard', { replace: true });
                    break;
                }
              }
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
          }
        }, 100);
      } else {
        setProfile(null);
      }
    });

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
          }
          setProfile(data);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
