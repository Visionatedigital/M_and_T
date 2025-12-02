import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Users, DollarSign, ArrowRight } from "lucide-react";
import { DisbursementChart } from "@/components/staff/DisbursementChart";

const StaffDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [promptText, setPromptText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/staff-login");
        return;
      }

      // Verify user has staff role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles || !roles.some(r => r.role === "admin" || r.role === "loan_officer")) {
        await supabase.auth.signOut();
        navigate("/staff-login");
        return;
      }

      // Fetch user profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(profile.first_name || "");
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptText.trim()) {
      navigate("/staff-dashboard/ask-ai", { state: { initialPrompt: promptText } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-8 bg-muted/30">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Hello {userName || "there"}! 👋
                  </h1>
                  <p className="text-muted-foreground">Welcome to your staff portal</p>
                </div>

                <form onSubmit={handleAskAI} className="relative">
                  <div className="glow-box relative rounded-lg p-[2px] bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-glow">
                    <div className="bg-background rounded-lg p-4 flex gap-2">
                      <Input
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Ask AI anything about loans, applications, or get insights..."
                        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Button 
                        type="submit" 
                        disabled={!promptText.trim()}
                        className="gap-2"
                      >
                        Ask AI
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Applications
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">48</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Review
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">
                      Requires attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Clients
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,345</div>
                    <p className="text-xs text-muted-foreground">
                      +180 this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Disbursed
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX 45.2M</div>
                    <p className="text-xs text-muted-foreground">
                      +20% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <DisbursementChart />

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest loan applications and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Activity feed will be displayed here
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StaffDashboard;
