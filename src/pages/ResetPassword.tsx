
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, AlertCircle, Calendar, CheckCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const supabaseConfigured = isSupabaseConfigured();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabaseConfigured) {
      toast({
        title: "Configuration Error",
        description: "Supabase environment variables are not configured properly.",
        variant: "destructive",
      });
      return;
    }
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast({
        title: "Reset link sent",
        description: "Check your inbox for the password reset link",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-purple to-white flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-light-purple/50 to-white opacity-90"></div>
      
      <div className="relative w-full max-w-md">
        {/* Back to Login Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-purple-primary hover:text-purple-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>

        <Card className="backdrop-blur-sm bg-white/90 shadow-2xl border-0 shadow-purple-primary/10">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-purple-primary/10 rounded-2xl flex items-center justify-center">
                {isSuccess ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Calendar className="w-6 h-6 text-purple-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-dark-gray mb-2">
              {isSuccess ? "Check your email" : "Reset password"}
            </CardTitle>
            <CardDescription className="text-dark-gray/70 text-lg">
              {isSuccess 
                ? "We've sent a password reset link to your email address" 
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
            {!supabaseConfigured && !isSuccess && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mt-4 flex items-start text-sm">
                <AlertCircle className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" />
                <span>Supabase environment variables are not configured. Reset password functionality will be limited.</span>
              </div>
            )}
          </CardHeader>
          
          {!isSuccess ? (
            <>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-6">
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
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-purple-primary hover:bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="text-center py-8">
              <div className="max-w-sm mx-auto">
                <p className="text-dark-gray/70 mb-6">
                  If an account with that email exists, you'll receive instructions to reset your password shortly.
                </p>
                <p className="text-sm text-dark-gray/60">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
            </CardContent>
          )}
          
          <CardFooter className="pt-6">
            <Link 
              to="/login" 
              className="w-full text-center text-purple-primary hover:text-purple-600 transition-colors font-medium"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
