
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      
      console.log('Auth state changed:', event, newSession?.user?.id);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Handle profile loading with proper error handling
      if (newSession?.user?.id) {
        setTimeout(async () => {
          if (!isMounted) return;
          
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .maybeSingle();
              
            if (error) {
              console.error('Error fetching profile:', error);
              // If profile doesn't exist, create it
              if (error.code === 'PGRST116') {
                console.log('Profile not found, creating...');
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert([
                    { 
                      id: newSession.user.id, 
                      full_name: newSession.user.user_metadata?.full_name || '',
                      email: newSession.user.email || '',
                      role: newSession.user.user_metadata?.role || 'user'
                    }
                  ])
                  .select()
                  .single();
                
                if (createError) {
                  console.error('Error creating profile:', createError);
                } else {
                  setProfile(newProfile);
                  console.log('Profile created:', newProfile);
                }
              }
            } else {
              setProfile(data);
              console.log('Profile loaded:', data);
            }
          } catch (error) {
            console.error('Unexpected error fetching profile:', error);
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
        console.log('Initial session:', initialSession?.user?.id);
        
        if (!isMounted) return;
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user?.id) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', initialSession.user.id)
              .maybeSingle();
            
            if (error) {
              console.error('Error fetching initial profile:', error);
            } else {
              setProfile(data);
              console.log('Initial profile loaded:', data);
            }
          } catch (error) {
            console.error('Error in initial profile fetch:', error);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: !!user
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
