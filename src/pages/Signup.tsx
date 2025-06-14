
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from "lucide-react";
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
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting signup with role:', userRole);
      
      // Sign up user with Supabase
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
        
        // Check if email confirmation is required
        if (!data.session) {
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account, then you can log in.",
          });
        } else {
          toast({
            title: "Account created successfully!",
            description: "You will be redirected to your dashboard shortly.",
          });
        }
        
        // Redirect to login after successful signup
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "There was a problem creating your account. Please try again.";
      if (error.message.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (error.message.includes("Password should be")) {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      }
      
      toast({
        title: "Signup failed",
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
        title: "Signup failed",
        description: "Could not sign up with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

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
                  Password must be at least 6 characters long.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup defaultValue={userRole} onValueChange={setUserRole} className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Event Attendee</div>
                        <div className="text-sm text-gray-500">RSVP and attend events</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="host" id="host" />
                    <Label htmlFor="host" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Event Host</div>
                        <div className="text-sm text-gray-500">Create and manage events</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex-1 cursor-pointer">
                      <div>
                        <div className="font-medium">Administrator</div>
                        <div className="text-sm text-gray-500">Full system access</div>
                      </div>
                    </Label>
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
