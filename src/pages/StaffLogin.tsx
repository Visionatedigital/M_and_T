import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
const appIcon = `${import.meta.env.BASE_URL}icon.png`;

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const user = await api.auth.getMe();
        if (user) {
          navigate("/staff-dashboard");
        }
      } catch {
        localStorage.removeItem("token");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.auth.login({
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
    <div className="min-h-screen flex flex-col bg-[#0c1929] text-white">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-2xl bg-white p-3 sm:p-4 shadow-lg shadow-black/25 ring-1 ring-white/20">
              <img
                src={appIcon}
                alt="M&T Microfinance (U) Ltd"
                className="h-16 md:h-24 w-auto max-w-[min(100%,280px)] object-contain block mx-auto"
              />
            </div>
            <p className="text-slate-300 text-sm md:text-base max-w-md leading-relaxed">
              Developing Together — Your trusted microfinance partner in Uganda.
            </p>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Staff Portal</h1>
              <p className="text-slate-400 mt-2 text-sm">Sign in to access the staff dashboard</p>
            </div>
          </div>

          <form
            onSubmit={handleSignIn}
            className="space-y-5 bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-xl"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152a45]" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StaffLogin;
