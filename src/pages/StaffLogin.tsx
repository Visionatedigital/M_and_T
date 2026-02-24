import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, isRemoteMode } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import smeImg from "@/assets/sme-loan.jpg";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Clear any existing session on mount — forces re-authentication
    localStorage.removeItem('token');
    console.log("🔒 Session cleared — re-authentication required");
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.auth.login({ email, password });
      toast({
        title: "Welcome back!",
        description: `Signed in as ${email}`,
      });
      navigate("/staff-dashboard");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid credentials. Try admin@example.com / admin123",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${smeImg})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90" />
      <main className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <img
              src="/icon.png"
              alt="M&T Growth Gateway"
              className="w-20 h-20 mx-auto mb-4 rounded-2xl"
            />
            <h1 className="text-3xl font-bold text-white">M&T Microfinance (U) LTD</h1>
            <p className="text-slate-400 mt-2">
              Sign in to access the staff portal
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6 bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20 shadow-2xl">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
              />
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-xs text-center text-slate-500">
              {isRemoteMode ? '☁️ Connected to shared server' : '💻 Local Mode — Data stored on this device'}
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StaffLogin;
