
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Calendar, ArrowLeft, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const supabaseConfigured = isSupabaseConfigured();

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
    
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting signup with role:', userRole);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: userRole,
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        if (!data.session) {
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account, then you can sign in.",
          });
        } else {
          toast({
            title: "Welcome to InviteJoy!",
            description: "Your account has been created successfully.",
          });
        }
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "There was a problem creating your account. Please try again.";
      if (error.message.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please try signing in instead.";
      } else if (error.message.includes("Password should be")) {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            role: userRole
          }
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast({
        title: "Sign up failed",
        description: "Could not sign up with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-purple to-white flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-light-purple/50 to-white opacity-90"></div>
      
      <div className="relative w-full max-w-md">
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-purple-primary hover:text-purple-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <Card className="backdrop-blur-sm bg-white/90 shadow-2xl border-0 shadow-purple-primary/10">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-purple-primary/10 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-dark-gray mb-2">Create your account</CardTitle>
            <CardDescription className="text-dark-gray/70 text-lg">
              Start creating amazing events today
            </CardDescription>
            {!supabaseConfigured && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mt-4 flex items-start text-sm">
                <AlertCircle className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" />
                <span>Supabase environment variables are not configured. Signup functionality will be limited.</span>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-dark-gray font-medium">Full name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-gray/40" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-purple-primary focus:ring-purple-primary/20 rounded-xl text-base"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-dark-gray font-medium">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-gray/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-purple-primary focus:ring-purple-primary/20 rounded-xl text-base"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-dark-gray font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-gray/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 border-gray-200 focus:border-purple-primary focus:ring-purple-primary/20 rounded-xl text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-gray/40 hover:text-dark-gray transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-dark-gray/60 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>
              
              <div className="space-y-4">
                <Label className="text-dark-gray font-medium">I want to</Label>
                <RadioGroup defaultValue={userRole} onValueChange={setUserRole} className="space-y-3">
                  <div className="flex items-center space-x-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-light-purple/30 hover:border-purple-primary/30 transition-all">
                    <RadioGroupItem value="user" id="user" className="border-purple-primary text-purple-primary" />
                    <Label htmlFor="user" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-dark-gray">Attend events</div>
                          <div className="text-sm text-dark-gray/70">RSVP and join amazing events</div>
                        </div>
                        <Check className="w-5 h-5 text-purple-primary opacity-0 group-data-[state=checked]:opacity-100" />
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-light-purple/30 hover:border-purple-primary/30 transition-all">
                    <RadioGroupItem value="host" id="host" className="border-purple-primary text-purple-primary" />
                    <Label htmlFor="host" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-dark-gray">Host events</div>
                          <div className="text-sm text-dark-gray/70">Create and manage your own events</div>
                        </div>
                        <Check className="w-5 h-5 text-purple-primary opacity-0 group-data-[state=checked]:opacity-100" />
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-purple-primary hover:bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 pt-6">
            <div className="relative flex items-center w-full">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-6 text-dark-gray/60 text-sm font-medium">or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleGoogleSignup}
              className="w-full h-12 border-2 border-gray-200 text-dark-gray hover:text-purple-primary hover:border-purple-primary/30 hover:bg-light-purple/20 transition-all duration-200 rounded-xl font-medium text-base"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            
            <p className="text-center text-dark-gray/70">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-semibold text-purple-primary hover:text-purple-600 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
