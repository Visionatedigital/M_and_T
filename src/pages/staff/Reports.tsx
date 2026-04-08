import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, DollarSign, Users, TrendingUp, FileText, FileSpreadsheet, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { staffTabButtonClass, staffTabRowClass } from "@/lib/staffNavClasses";

interface LoanStats {
  totalApplications: number;
  approvedLoans: number;
  rejectedLoans: number;
  pendingLoans: number;
  totalDisbursed: number;
  totalInterest: number;
  totalPaid?: number;
  rejectionRate: number;
  approvalRate: number;
  disbursedCount?: number;
  completedCount?: number;
  settledCount?: number;
  underReviewCount?: number;
  avgDurationMonths?: number;
  outstandingEstimate?: number;
  repaymentsLast30Days?: number;
  collectionEfficiencyPct?: number;
}

interface ProductStats {
  product: string;
  applications: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}

interface BranchStatRow {
  branch: string;
  applications: number;
  principalBooked: number;
}

interface CategoryStatRow {
  category: string;
  applications: number;
  totalPrincipal: number;
}

const Reports = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
  const [branchStats, setBranchStats] = useState<BranchStatRow[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStatRow[]>([]);
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExportingAI, setIsExportingAI] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingZScore, setIsExportingZScore] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const filteredProductStats = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return productStats;
    return productStats.filter((p) =>
      (p.product || "").toLowerCase().includes(q) ||
      String(p.applications).includes(q) ||
      String(p.totalAmount).includes(q)
    );
  }, [productStats, productSearch]);

  const handleAiExport = async () => {
    setIsExportingAI(true);
    try {
      await api.reports.downloadAiSummaryDocx();
      toast({ title: "Success", description: "AI Summary downloaded successfully." });
    } catch (error: any) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExportingAI(false);
    }
  };

  const handleZScoreExport = async () => {
    setIsExportingZScore(true);
    try {
      await api.reports.downloadFinancialAnalysisDocx();
      toast({ title: "Success", description: "Z-Score Analysis generated ✓" });
    } catch (error: any) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExportingZScore(false);
    }
  };

  const handleExcelExport = async () => {
    setIsExportingExcel(true);
    try {
      await api.reports.downloadFinancialExportXlsx();
      toast({ title: "Success", description: "Financial Report downloaded successfully." });
    } catch (error: any) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Determine active tab from route
  const getActiveTab = () => {
    const path = location.pathname;
    // Financial reports are restricted to admins
    if (path.includes("/financial") && userRole === "admin") return "financial";
    if (path.includes("/clients") || path.includes("/borrowers")) return "clients";
    return "loans";
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await api.auth.getMe();
      if (user) {
        setUserRole(user.role);
        setCurrentUserId(user.id);

        if (user.role === 'loan_officer') {
          toast({
            title: "Access Denied",
            description: "You do not have permission to view reports.",
            variant: "destructive",
          });
          navigate("/staff-dashboard");
          return;
        }

        loadReports();
      }
    } catch (err) {
      navigate("/staff-login");
    }
  };

  const loadReports = async () => {
    try {
      const data = await api.reports.getStats();
      setLoanStats(data.loanStats);
      setProductStats(data.productStats);
      setClientStats(data.clientStats);
      setBranchStats(data.branchStats ?? []);
      setCategoryStats(data.categoryStats ?? []);
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Reports</h1>
                  <p className="text-muted-foreground">View comprehensive reports and analytics</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={handleAiExport}
                    disabled={isExportingAI}
                    className="bg-white/50 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                  >
                    {isExportingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4 text-blue-600" />}
                    AI Summary (Word)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleZScoreExport}
                    disabled={isExportingZScore}
                    className="bg-white/50 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
                  >
                    {isExportingZScore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4 text-purple-600" />}
                    Z-Score (Word)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExcelExport}
                    disabled={isExportingExcel}
                    className="bg-white/50 backdrop-blur-sm border-green-200 hover:bg-green-50"
                  >
                    {isExportingExcel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />}
                    Financials (Excel)
                  </Button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className={staffTabRowClass}>
                <Button
                  variant={getActiveTab() === "loans" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/reports/loans")}
                  className={staffTabButtonClass}
                >
                  <BarChart3 className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
                  {userRole === "loan_officer" ? "My Reports" : "Loan Reports"}
                </Button>
                {userRole === "admin" && (
                  <Button
                    variant={getActiveTab() === "financial" ? "default" : "ghost"}
                    onClick={() => navigate("/staff-dashboard/reports/financial")}
                    className={staffTabButtonClass}
                  >
                    <DollarSign className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
                    Financial Reports
                  </Button>
                )}
                <Button
                  variant={getActiveTab() === "clients" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/reports/clients")}
                  className={staffTabButtonClass}
                >
                  <Users className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
                  Client Reports
                </Button>
              </div>

              {/* Loan Reports */}
              {getActiveTab() === "loans" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>{userRole === "loan_officer" ? "My Performance" : "Loan Performance"}</CardTitle>
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
                          {(loanStats.underReviewCount ?? 0) > 0 && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Under review:</span>
                              <span>{loanStats.underReviewCount}</span>
                            </div>
                          )}
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
                            <span>Total Principal Disbursed:</span>
                            <span className="font-bold">UGX {loanStats.totalDisbursed.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Interest (est. 30% flat):</span>
                            <span className="font-bold text-green-600">UGX {loanStats.totalInterest.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total repaid (portfolio):</span>
                            <span className="font-bold">UGX {(loanStats.totalPaid ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span>Avg Loan Size:</span>
                            <span className="font-bold">
                              UGX {loanStats.approvedLoans > 0
                                ? (loanStats.totalDisbursed / loanStats.approvedLoans).toLocaleString()
                                : 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg tenor (months):</span>
                            <span className="font-bold">{(loanStats.avgDurationMonths ?? 0).toFixed(1)}</span>
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pipeline & lifecycle</CardTitle>
                        <CardDescription>Counts by application status</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Disbursed loans</span>
                          <span className="font-semibold">{loanStats.disbursedCount ?? "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed</span>
                          <span className="font-semibold">{loanStats.completedCount ?? "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Settled</span>
                          <span className="font-semibold">{loanStats.settledCount ?? "—"}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Outstanding (est. principal+30% − repayments)</span>
                          <span className="font-semibold text-amber-700">
                            UGX {(loanStats.outstandingEstimate ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Collections</CardTitle>
                        <CardDescription>Recent cash-in vs portfolio</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Repayments (last 30 days)</span>
                          <span className="font-semibold">UGX {(loanStats.repaymentsLast30Days ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Collection efficiency (est.)</span>
                          <span className="font-semibold">
                            {(loanStats.collectionEfficiencyPct ?? 0).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">
                          Efficiency compares total repaid to expected portfolio (principal × 1.3). Use accounting for audited figures.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>By branch</CardTitle>
                        <CardDescription>Applications and booked principal where branch is set</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Branch</TableHead>
                              <TableHead className="text-right">Applications</TableHead>
                              <TableHead className="text-right">Principal (active)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {branchStats.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                  No branch data
                                </TableCell>
                              </TableRow>
                            ) : (
                              branchStats.map((b) => (
                                <TableRow key={b.branch}>
                                  <TableCell className="font-medium">{b.branch}</TableCell>
                                  <TableCell className="text-right">{b.applications}</TableCell>
                                  <TableCell className="text-right">UGX {b.principalBooked.toLocaleString()}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>By loan category</CardTitle>
                        <CardDescription>Volume and count per category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Applications</TableHead>
                              <TableHead className="text-right">Total principal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categoryStats.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                  No category data
                                </TableCell>
                              </TableRow>
                            ) : (
                              categoryStats.map((c) => (
                                <TableRow key={c.category}>
                                  <TableCell className="font-medium">{c.category}</TableCell>
                                  <TableCell className="text-right">{c.applications}</TableCell>
                                  <TableCell className="text-right">UGX {c.totalPrincipal.toLocaleString()}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
                      <div>
                        <CardTitle>Product Performance</CardTitle>
                        <CardDescription>Breakdown by loan product</CardDescription>
                      </div>
                      <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          className="pl-9"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Applications</TableHead>
                            <TableHead>Approved</TableHead>
                            <TableHead>Rejected</TableHead>
                            <TableHead>Total Principal Disbursed</TableHead>
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
                          ) : filteredProductStats.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No products match your search.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredProductStats.map((product) => (
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
                            <span>Total Principal Disbursed:</span>
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

