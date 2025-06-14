
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
        // Use setTimeout to avoid blocking the auth state change
        setTimeout(async () => {
          try {
            console.log('Fetching profile for user:', newSession.user.id);
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
              
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching profile:', error);
              setProfile(null);
            } else {
              console.log('Profile fetched:', data);
              setProfile(data);
              
              // Handle automatic redirection after login
              if (event === 'SIGNED_IN' && data?.role) {
                console.log('User signed in with role:', data.role);
                const currentPath = window.location.pathname;
                console.log('Current path:', currentPath);
                
                // Only redirect if user is on login/signup pages or root
                const shouldRedirect = currentPath === '/' || 
                                     currentPath === '/login' || 
                                     currentPath === '/signup';
                
                console.log('Should redirect:', shouldRedirect);
                
                if (shouldRedirect) {
                  // Redirect based on role
                  switch (data.role) {
                    case 'admin':
                      console.log('Redirecting to admin dashboard');
                      navigate('/admin-dashboard', { replace: true });
                      break;
                    case 'host':
                      console.log('Redirecting to host dashboard');
                      navigate('/host-dashboard', { replace: true });
                      break;
                    case 'user':
                    default:
                      console.log('Redirecting to user dashboard');
                      navigate('/user-dashboard', { replace: true });
                      break;
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error in profile fetching:', error);
            setProfile(null);
          }
        }, 200); // Increased timeout to give more time for profile fetch
      } else {
        setProfile(null);
      }
    });

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user?.id) {
          console.log('Initial session found, fetching profile...');
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();
            
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching initial profile:', error);
          } else {
            console.log('Initial profile fetched:', data);
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
      console.log('Signing out...');
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
