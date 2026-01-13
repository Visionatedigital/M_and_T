import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, DollarSign, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoanStats {
  totalApplications: number;
  approvedLoans: number;
  rejectedLoans: number;
  pendingLoans: number;
  totalDisbursed: number;
  totalInterest: number;
  rejectionRate: number;
  approvalRate: number;
}

interface ProductStats {
  product: string;
  applications: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}

const Reports = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [loanStats, setLoanStats] = useState<LoanStats>({
    totalApplications: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    pendingLoans: 0,
    totalDisbursed: 0,
    totalInterest: 0,
    rejectionRate: 0,
    approvalRate: 0,
  });
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Determine active tab from route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/financial")) return "financial";
    if (path.includes("/clients")) return "clients";
    return "loans";
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff-login");
      return;
    }
    loadReports();
  };

  const loadReports = async () => {
    try {
      // Load all loan applications
      const { data: loans, error: loansError } = await supabase
        .from("loan_applications")
        .select("*");

      if (loansError) throw loansError;

      // Calculate loan statistics
      const totalApplications = loans?.length || 0;
      const approvedLoans = loans?.filter(l => l.status === "approved" || l.status === "disbursed").length || 0;
      const rejectedLoans = loans?.filter(l => l.status === "rejected").length || 0;
      const pendingLoans = loans?.filter(l => l.status === "pending" || l.status === "under_review").length || 0;

      const approvedLoanAmounts = loans?.filter(l => l.status === "approved" || l.status === "disbursed")
        .map(l => Number(l.loan_amount)) || [];
      const totalDisbursed = approvedLoanAmounts.reduce((sum, amt) => sum + amt, 0);
      const totalInterest = approvedLoanAmounts.reduce((sum, amt) => sum + (amt * 0.30), 0);

      const rejectionRate = totalApplications > 0 ? (rejectedLoans / totalApplications) * 100 : 0;
      const approvalRate = totalApplications > 0 ? (approvedLoans / totalApplications) * 100 : 0;

      setLoanStats({
        totalApplications,
        approvedLoans,
        rejectedLoans,
        pendingLoans,
        totalDisbursed,
        totalInterest,
        rejectionRate,
        approvalRate,
      });

      // Calculate product statistics
      const productMap = new Map<string, ProductStats>();
      loans?.forEach((loan: any) => {
        const product = loan.loan_product;
        if (!productMap.has(product)) {
          productMap.set(product, {
            product,
            applications: 0,
            approved: 0,
            rejected: 0,
            totalAmount: 0,
          });
        }
        const stats = productMap.get(product)!;
        stats.applications++;
        if (loan.status === "approved" || loan.status === "disbursed") {
          stats.approved++;
          stats.totalAmount += Number(loan.loan_amount);
        } else if (loan.status === "rejected") {
          stats.rejected++;
        }
      });

      setProductStats(Array.from(productMap.values()));

      // Load client statistics
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, created_at");

      if (!profilesError && profiles) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newClientsThisMonth = profiles.filter(p => 
          new Date(p.created_at) >= startOfMonth
        ).length;

        // Count active clients (those with approved/disbursed loans)
        const activeClientIds = new Set(
          loans?.filter(l => l.status === "approved" || l.status === "disbursed")
            .map(l => l.user_id) || []
        );

        setClientStats({
          totalClients: profiles.length,
          activeClients: activeClientIds.size,
          newClientsThisMonth,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Reports</h1>
                <p className="text-muted-foreground">View comprehensive reports and analytics</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={getActiveTab() === "loans" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/reports/loans")}
                  className="rounded-b-none"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Loan Reports
                </Button>
                <Button
                  variant={getActiveTab() === "financial" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/reports/financial")}
                  className="rounded-b-none"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Financial Reports
                </Button>
                <Button
                  variant={getActiveTab() === "clients" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/reports/clients")}
                  className="rounded-b-none"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Client Reports
                </Button>
              </div>

              {/* Loan Reports */}
              {getActiveTab() === "loans" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Loan Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Applications:</span>
                            <span className="font-bold">{loanStats.totalApplications}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Approved Loans:</span>
                            <span className="font-bold text-green-600">{loanStats.approvedLoans}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rejected Loans:</span>
                            <span className="font-bold text-red-600">{loanStats.rejectedLoans}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pending Loans:</span>
                            <span className="font-bold text-yellow-600">{loanStats.pendingLoans}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span>Approval Rate:</span>
                            <span className="font-bold">{loanStats.approvalRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rejection Rate:</span>
                            <span className="font-bold">{loanStats.rejectionRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Disbursed:</span>
                            <span className="font-bold">UGX {loanStats.totalDisbursed.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Interest:</span>
                            <span className="font-bold text-green-600">UGX {loanStats.totalInterest.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span>Avg Loan Size:</span>
                            <span className="font-bold">
                              UGX {loanStats.approvedLoans > 0 
                                ? (loanStats.totalDisbursed / loanStats.approvedLoans).toLocaleString()
                                : 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Status Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Approved:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-600" 
                                  style={{ width: `${loanStats.approvalRate}%` }}
                                />
                              </div>
                              <span className="font-bold">{loanStats.approvedLoans}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Rejected:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-600" 
                                  style={{ width: `${loanStats.rejectionRate}%` }}
                                />
                              </div>
                              <span className="font-bold">{loanStats.rejectedLoans}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Pending:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-600" 
                                  style={{ 
                                    width: `${loanStats.totalApplications > 0 
                                      ? (loanStats.pendingLoans / loanStats.totalApplications) * 100 
                                      : 0}%` 
                                  }}
                                />
                              </div>
                              <span className="font-bold">{loanStats.pendingLoans}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Product Performance</CardTitle>
                      <CardDescription>Breakdown by loan product</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Applications</TableHead>
                            <TableHead>Approved</TableHead>
                            <TableHead>Rejected</TableHead>
                            <TableHead>Total Disbursed</TableHead>
                            <TableHead>Approval Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productStats.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No product data available
                              </TableCell>
                            </TableRow>
                          ) : (
                            productStats.map((product) => (
                              <TableRow key={product.product}>
                                <TableCell className="font-medium">{product.product}</TableCell>
                                <TableCell>{product.applications}</TableCell>
                                <TableCell className="text-green-600">{product.approved}</TableCell>
                                <TableCell className="text-red-600">{product.rejected}</TableCell>
                                <TableCell>UGX {product.totalAmount.toLocaleString()}</TableCell>
                                <TableCell>
                                  {product.applications > 0
                                    ? ((product.approved / product.applications) * 100).toFixed(1)
                                    : 0}%
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Financial Reports */}
              {getActiveTab() === "financial" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Interest Earned:</span>
                            <span className="font-bold text-green-600">
                              UGX {loanStats.totalInterest.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Disbursed:</span>
                            <span className="font-bold">UGX {loanStats.totalDisbursed.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span>Projected Revenue:</span>
                            <span className="font-bold text-primary">
                              UGX {(loanStats.totalDisbursed + loanStats.totalInterest).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Average Loan Size:</span>
                            <span className="font-bold">
                              UGX {loanStats.approvedLoans > 0
                                ? (loanStats.totalDisbursed / loanStats.approvedLoans).toLocaleString()
                                : 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Interest Rate:</span>
                            <span className="font-bold">30% (flat)</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span>Total Portfolio Value:</span>
                            <span className="font-bold text-primary">
                              UGX {(loanStats.totalDisbursed + loanStats.totalInterest).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Client Reports */}
              {getActiveTab() === "clients" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Clients:</span>
                          <span className="font-bold">{clientStats.totalClients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Clients:</span>
                          <span className="font-bold text-green-600">{clientStats.activeClients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>New Clients (This Month):</span>
                          <span className="font-bold text-primary">{clientStats.newClientsThisMonth}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span>Client Retention Rate:</span>
                          <span className="font-bold">
                            {clientStats.totalClients > 0
                              ? ((clientStats.activeClients / clientStats.totalClients) * 100).toFixed(1)
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Reports;

