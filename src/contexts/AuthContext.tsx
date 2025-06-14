
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
  clearAndRestart: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to clear all auth state and restart
  const clearAndRestart = () => {
    console.log('Clearing all auth state and restarting...');
    localStorage.clear();
    sessionStorage.clear();
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
    navigate('/login', { replace: true });
  };

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
    let timeoutId: NodeJS.Timeout;

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out, clearing loading state');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      if (!mounted) return;

      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId);

      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user?.id) {
        // Fetch profile for authenticated user with timeout
        timeoutId = setTimeout(async () => {
          if (!mounted) return;
          
          const userProfile = await fetchProfile(newSession.user.id);
          
          if (mounted) {
            setProfile(userProfile);
            
            // Handle redirection only on sign in
            if (event === 'SIGNED_IN' && userProfile) {
              handleRedirection(userProfile);
            }
            setLoading(false);
          }
        }, 100);
      } else {
        if (mounted) {
          setProfile(null);
          setLoading(false);
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
      clearTimeout(safetyTimeout);
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      setLoading(true);
      await supabase.auth.signOut();
      
      // Clear all local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      setLoading(false);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
      // Force clear even if signOut fails
      clearAndRestart();
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    clearAndRestart
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
