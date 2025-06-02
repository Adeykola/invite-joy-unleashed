
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  const supabaseConfigured = isSupabaseConfigured();

  // Redirect authenticated users away from signup page
  useEffect(() => {
    if (!loading && user && profile) {
      console.log('User already authenticated, redirecting...', { user: user.id, role: profile.role });
      
      if (profile.role === 'admin') {
        navigate('/admin');
      } else if (profile.role === 'host') {
        navigate('/host');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Supabase environment variables are not configured properly.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting to sign up with email:', email, 'role:', userRole);
      
      // Sign up user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: userRole,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Sign up successful, user ID:', data.user?.id);
      
      if (data.user) {
        // Create a profile record in the profiles table
        console.log('Creating profile for user:', data.user.id);
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              full_name: name, 
              email, 
              role: userRole 
            }
          ]);
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
        
        console.log('Profile created successfully');
      }
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account, then you can log in.",
      });
      
      // Wait a moment and redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "There was a problem creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!supabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Supabase environment variables are not configured properly.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Attempting Google OAuth signup');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast({
        title: "Signup failed",
        description: "Could not sign up with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading while checking authentication state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to get started
          </CardDescription>
          {!supabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 mt-2 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Supabase environment variables are not configured. Signup functionality will be limited.</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long and include a number and a special character.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>I want to...</Label>
                <RadioGroup defaultValue={userRole} onValueChange={setUserRole} className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="host" id="host" />
                    <Label htmlFor="host" className="flex-1 cursor-pointer">Create and host events</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="flex-1 cursor-pointer">Respond to invitations</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative flex items-center w-full">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 flex-shrink text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>
            Sign up with Google
          </Button>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
