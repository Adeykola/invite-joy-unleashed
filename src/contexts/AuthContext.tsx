
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

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  };

  // Handle redirection based on user role
  const handleRedirection = (userProfile: UserProfile) => {
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath, 'User role:', userProfile.role);
    
    // Only redirect from auth pages or root
    const shouldRedirect = ['/login', '/signup', '/'].includes(currentPath);
    
    if (shouldRedirect) {
      const dashboardMap = {
        admin: '/admin-dashboard',
        host: '/host-dashboard',
        user: '/user-dashboard'
      };
      
      const targetPath = dashboardMap[userProfile.role];
      console.log('Redirecting to:', targetPath);
      navigate(targetPath, { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user?.id) {
        // Fetch profile for authenticated user
        const userProfile = await fetchProfile(newSession.user.id);
        
        if (mounted) {
          setProfile(userProfile);
          
          // Handle redirection only on sign in
          if (event === 'SIGNED_IN' && userProfile) {
            handleRedirection(userProfile);
          }
        }
      } else {
        if (mounted) {
          setProfile(null);
        }
      }
    });

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user?.id) {
          const userProfile = await fetchProfile(initialSession.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
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
