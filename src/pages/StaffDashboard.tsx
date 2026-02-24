
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Users, DollarSign, ArrowRight, Activity, TrendingUp, AlertCircle, Percent, CheckCircle2, BarChart3, Clock, Wallet } from "lucide-react";
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
    activeLoans: 0,
    monthlyDisbursement: 0,
    monthlyCount: 0,
    outstandingPortfolio: 0,
    par30: 0,
    collectionRate: 0,
    totalDisbursed: 0
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
                <Card className="border-l-4 border-l-primary shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {isLoanOfficer ? "My Gross Portfolio" : "Gross Loan Portfolio (GLP)"}
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {(stats.outstandingPortfolio / 1000000).toFixed(1)}M</div>
                    <div className="flex items-center mt-1 text-xs text-blue-600 font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Total outstanding balance
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Portfolio at Risk (PAR 30)
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {(stats.par30 / 1000000).toFixed(2)}M</div>
                    <div className="flex items-center mt-1 text-xs text-red-600 font-medium">
                      <Activity className="h-3 w-3 mr-1" />
                      4.5% Risk Indicator (Est.)
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Monthly Disbursement
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {(stats.monthlyDisbursement / 1000000).toFixed(1)}M</div>
                    <div className="flex items-center mt-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {stats.monthlyCount} Loans this month
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Collection Efficiency
                    </CardTitle>
                    <Percent className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.collectionRate}%</div>
                    <div className="flex items-center mt-1 text-xs text-amber-600 font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Repayment Performance
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Volume Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                <div className="bg-background rounded-lg border p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <div className="p-2 rounded-full bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Apps</p>
                    <p className="text-lg font-bold">{stats.totalApplications}</p>
                  </div>
                </div>

                <div className="bg-background rounded-lg border p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <div className="p-2 rounded-full bg-amber-50">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending Review</p>
                    <p className="text-lg font-bold">{stats.pendingApplications}</p>
                  </div>
                </div>

                <div className="bg-background rounded-lg border p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <div className="p-2 rounded-full bg-green-50">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Loans</p>
                    <p className="text-lg font-bold">{stats.activeLoans}</p>
                  </div>
                </div>

                <div className="bg-background rounded-lg border p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
                  <div className="p-2 rounded-full bg-purple-50">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Disbursed Volume</p>
                    <p className="text-lg font-bold">UGX {(stats.totalDisbursed / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DisbursementChart />
                <GrowthChart />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoiChart />
                <ForecastChart />
              </div>

              <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
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
                            <p className="text-sm font-semibold">{activity.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Status updated to <span className="capitalize font-semibold text-primary">{activity.status.replace('_', ' ')}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">UGX {Number(activity.loan_amount || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">
                              {new Date(activity.updated_at).toLocaleDateString()}
                            </p>
                          </div>
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
