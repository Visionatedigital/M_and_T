import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseOffline } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        // Try a simple query to check connection
        const { error } = await supabase.from("user_roles").select("count").limit(1);
        if (error && (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED'))) {
          setConnectionError('Supabase project is currently restoring. Please wait a few minutes and try again.');
        }
      } catch (err: any) {
        if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          setConnectionError('Cannot connect to Supabase. The project may be paused or restoring.');
        }
      }
    };

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED'))) {
          setConnectionError('Supabase project is currently restoring. Please wait a few minutes and try again.');
          return;
        }
        
        if (session) {
          // Check if user has staff role
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);
          
          if (roles && roles.some(r => r.role === "admin" || r.role === "loan_officer")) {
            navigate("/staff-dashboard");
          }
        }
      } catch (err: any) {
        if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          setConnectionError('Cannot connect to Supabase. The project may be paused or restoring.');
        }
      }
    };

    checkConnection();
    checkAuth();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify user has staff role
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (rolesError) throw rolesError;

      if (!roles || !roles.some(r => r.role === "admin" || r.role === "loan_officer")) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the staff portal.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to staff portal.",
      });

      navigate("/staff-dashboard");
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      
      // Check for connection errors
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
        setConnectionError('Cannot connect to Supabase. The project may be paused or restoring. Please check your Supabase dashboard.');
        toast({
          title: "Connection Error",
          description: "Unable to connect to Supabase. Please wait for the project to restore.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Staff Portal</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access the staff dashboard
            </p>
          </div>

          {(connectionError || isSupabaseOffline) && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                Supabase Project Restoring
              </AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-300 space-y-2">
                <p>{connectionError || 'Your Supabase project is currently being restored.'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <a 
                    href="https://app.supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm underline flex items-center gap-1"
                  >
                    Check Supabase Dashboard <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-xs mt-2">
                  <strong>Tip:</strong> Public pages (Home, About, Products) are still accessible while Supabase restores.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSignIn} className="space-y-6 bg-card p-8 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaffLogin;
