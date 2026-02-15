
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Users, DollarSign, ArrowRight } from "lucide-react";
import { DisbursementChart } from "@/components/staff/DisbursementChart";
import { GrowthChart } from "@/components/staff/GrowthChart";
import { RoiChart } from "@/components/staff/RoiChart";
import { ForecastChart } from "@/components/staff/ForecastChart";
import { useUserRole } from "@/hooks/useUserRole";

const StaffDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    activeClients: 0,
    totalDisbursed: 0,
    outstandingPortfolio: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await api.auth.getMe();
        if (!user) {
          navigate("/staff-login");
          return;
        }

        const data = await api.reports.getDashboardStats();
        setUserName(data.userName);
        setStats(data.stats);
        setActivities(data.activities);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        navigate("/staff-login");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  if (isLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isLoanOfficer = role === 'loan_officer';

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
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {isLoanOfficer ? "My Applications" : "Total Applications"}
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalApplications}</div>
                    <p className="text-xs text-muted-foreground">
                      {isLoanOfficer ? "Assigned to you" : "All branch applications"}
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
                    <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                    <p className="text-xs text-muted-foreground">
                      Requires attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {isLoanOfficer ? "My Active Clients" : "Active Clients"}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeClients}</div>
                    <p className="text-xs text-muted-foreground">
                      {isLoanOfficer ? "Clients in your portfolio" : "Total active clients"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {isLoanOfficer ? "Outstanding Portfolio" : "Total Outstanding Branch Portfolio"}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {(stats.outstandingPortfolio / 1000000).toFixed(1)}M</div>
                    <p className="text-xs text-muted-foreground">
                      {isLoanOfficer ? "Remaining balance (Principal + Interest)" : "Total branch outstanding balance"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DisbursementChart />
                <GrowthChart />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoiChart />
                <ForecastChart />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest loan applications and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.length > 0 ? (
                      activities.map((activity, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{activity.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Status updated to <span className="capitalize font-semibold">{activity.status.replace('_', ' ')}</span>
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No recent activity found
                      </p>
                    )}
                  </div>
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
