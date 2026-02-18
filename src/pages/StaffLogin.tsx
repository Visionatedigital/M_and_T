import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
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
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const user = await api.auth.getMe();
        if (user) {
          // Check roles in metadata or user_roles table if moved
          // For now, assuming metadata or just letting them in if getMe succeeds
          navigate("/staff-dashboard");
        }
      } catch (err) {
        localStorage.removeItem("token");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, token } = await api.auth.login({
        email,
        password,
      });

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to staff portal.",
      });

      navigate("/staff-dashboard");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
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

            <div className="space-y-4 pt-4 border-t">
              <p className="text-sm text-center text-muted-foreground">Test Accounts</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs h-auto py-2 flex flex-col gap-1 items-center"
                  onClick={() => {
                    setEmail("loanofficer@mandt.placeholder");
                    setPassword("Officer@2026");
                  }}
                >
                  <span className="font-semibold">Loan Officer</span>
                  <span className="text-[10px] opacity-70">loanofficer@...</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs h-auto py-2 flex flex-col gap-1 items-center"
                  onClick={() => {
                    setEmail("admin@mandt.placeholder");
                    setPassword("Admin@2026");
                  }}
                >
                  <span className="font-semibold">Admin</span>
                  <span className="text-[10px] opacity-70">admin@...</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StaffLogin;
