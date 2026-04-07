import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, Search, TrendingUp, DollarSign, Calendar, Users, Eye, FileSpreadsheet, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActiveLoan {
  id: string;
  user_id: string;
  full_name: string;
  loan_product: string;
  loan_amount: number;
  loan_duration_months: number;
  created_at: string;
  approved_at: string;
  status: string;
  principal: number;
  total_amount: number;
  amount_paid: number;
  remaining_balance: number;
  growth_rate: number;
  months_elapsed: number;
  months_remaining: number;
  group_id?: string | null;
  loan_duration_months?: number;
  loan_amount?: number;
}

const ActiveLoans = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<ActiveLoan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "groups">("list");
  const [selectedGroup, setSelectedGroup] = useState<{ groupId: string, groupName: string, members: ActiveLoan[] } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Determine filter from URL path
  const getFilterFromPath = () => {
    const path = location.pathname;
    if (path.includes("/schedule")) return "schedule";
    return "all";
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Update filter when route changes
  useEffect(() => {
    const filter = getFilterFromPath();
    // For now, we'll keep productFilter separate, but we can add route-based filtering later
  }, [location.pathname]);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, productFilter]);

  const checkAuth = async () => {
    try {
      await api.auth.getMe();
      loadActiveLoans();
    } catch (err) {
      navigate("/staff-login");
    }
  };

  const loadActiveLoans = async () => {
    try {
      const data = await api.applications.getActive();
      setLoans(data);
      return data as ActiveLoan[];
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    return undefined;
  };

  const filterLoans = () => {
    let filtered = loans;

    if (searchTerm) {
      filtered = filtered.filter(
        (loan) =>
          loan.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.loan_product.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (((loan as any).group_name || (loan as any).groups?.group_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (productFilter !== "all") {
      filtered = filtered.filter((loan) => loan.loan_product === productFilter);
    }

    setFilteredLoans(filtered);
  };

  const openGroupDialog = (groupId: string, groupName: string, members: ActiveLoan[]) => {
    setSelectedGroup({ groupId, groupName, members });
  };

  // Get unique loan products for filtering
  const getUniqueProducts = () => {
    const products = new Set(loans.map(loan => loan.loan_product));
    return Array.from(products);
  };

  // Group loans by group_id, only showing groups with 2+ members
  const getGroupedLoans = () => {
    const grouped = new Map<string, typeof filteredLoans>();

    filteredLoans.forEach(loan => {
      if (loan.group_id) {
        const existing = grouped.get(loan.group_id) || [];
        grouped.set(loan.group_id, [...existing, loan]);
      }
    });

    // Filter to only groups with 2+ members
    const groupsWithMultipleMembers = Array.from(grouped.entries())
      .filter(([_, members]) => members.length >= 2)
      .map(([groupId, members]) => ({
        groupId,
        groupName: (members[0] as any).group_name || (members[0] as any).groups?.group_name || 'Unknown Group',
        members,
        totalPrincipal: members.reduce((sum, m) => sum + (m.principal ?? 0), 0),
        totalPaid: members.reduce((sum, m) => sum + (m.amount_paid ?? 0), 0),
        totalRemaining: members.reduce((sum, m) => sum + (m.remaining_balance ?? 0), 0),
        memberCount: members.length,
      }))
      .sort((a, b) => b.totalPrincipal - a.totalPrincipal); // Sort by total principal descending

    return groupsWithMultipleMembers;
  };

  const calculateTotalStats = () => {
    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalDisbursed = loans.reduce((sum, loan) => sum + loan.total_amount, 0);
    const totalPaid = loans.reduce((sum, loan) => sum + loan.amount_paid, 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + loan.remaining_balance, 0);
    const avgGrowth = loans.length > 0
      ? loans.reduce((sum, loan) => sum + loan.growth_rate, 0) / loans.length
      : 0;

    return {
      totalPrincipal,
      totalDisbursed,
      totalPaid,
      totalRemaining,
      avgGrowth,
    };
  };

  const getGroupName = (loan: ActiveLoan) => ((loan as any).group_name || (loan as any).groups?.group_name || null) as string | null;
  const isGroupLoanEntry = (loan: ActiveLoan) => loan.loan_product === "Group Loan" || !!loan.group_id || !!getGroupName(loan);
  const getLoanTitle = (loan: ActiveLoan) => {
    const groupName = getGroupName(loan);
    const isGroupLoan = isGroupLoanEntry(loan);
    if (isGroupLoan && groupName) return groupName;
    return loan.loan_product;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = calculateTotalStats();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Active Loans</h1>
                  <p className="text-muted-foreground">Track active loans and money growth</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={!location.pathname.includes("/schedule") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/loans")}
                  className="rounded-b-none"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  All Loans
                </Button>
                <Button
                  variant={location.pathname.includes("/schedule") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/loans/schedule")}
                  className="rounded-b-none"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Loan Schedule
                </Button>
              </div>

              {/* Search on its own row so it’s never hidden below stat cards or off-screen */}
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  type="search"
                  placeholder="Search group, client, or loan product…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 w-full border-slate-200 bg-background shadow-sm"
                  aria-label="Search loans"
                />
              </div>

              {/* Product filters + view mode */}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex gap-2 flex-wrap items-center">
                  <Button
                    variant={productFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setProductFilter("all")}
                  >
                    All Products
                  </Button>
                  {getUniqueProducts().map((product) => (
                    <Button
                      key={product}
                      variant={productFilter === product ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProductFilter(product)}
                    >
                      {product}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    List View
                  </Button>
                  <Button
                    variant={viewMode === "groups" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("groups")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Groups View
                  </Button>
                </div>
              </div>

              {/* Schedule View */}
              {location.pathname.includes("/schedule") ? (
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Loan Repayment Schedule</CardTitle>
                      <CardDescription>
                        View repayment schedules for all active loans. Use the search bar above to filter.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredLoans.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No loans found</p>
                      ) : (
                        filteredLoans.map((loan) => {
                          const totalAmount = loan.total_amount ?? 0;
                          const duration = loan.loan_duration_months ?? 1;
                          const monthlyPayment = duration > 0 ? totalAmount / duration : 0;
                          const approvedDate = new Date(loan.approved_at || loan.created_at);
                          const schedule = [];

                          for (let i = 0; i < duration; i++) {
                            const dueDate = new Date(approvedDate);
                            dueDate.setMonth(dueDate.getMonth() + i + 1);
                            const isPast = dueDate < new Date();
                            const isCurrent = dueDate.getMonth() === new Date().getMonth() &&
                              dueDate.getFullYear() === new Date().getFullYear();

                            schedule.push({
                              installment: i + 1,
                              dueDate,
                              amount: monthlyPayment,
                              status: isPast ? "paid" : isCurrent ? "due" : "upcoming",
                            });
                          }

                          return (
                            <Card key={loan.id} className="mb-4">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{loan.full_name}</CardTitle>
                                    <CardDescription>{getLoanTitle(loan)} - UGX {(loan.loan_amount ?? 0).toLocaleString()}</CardDescription>
                                  </div>
                                  <Badge variant="outline">{duration} months</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Installment</TableHead>
                                      <TableHead>Due Date</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {schedule.map((payment) => (
                                      <TableRow key={payment.installment}>
                                        <TableCell className="font-medium">{payment.installment}</TableCell>
                                        <TableCell>{payment.dueDate.toLocaleDateString()}</TableCell>
                                        <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={
                                              payment.status === "paid"
                                                ? "default"
                                                : payment.status === "due"
                                                  ? "destructive"
                                                  : "outline"
                                            }
                                          >
                                            {payment.status === "paid"
                                              ? "Paid"
                                              : payment.status === "due"
                                                ? "Due"
                                                : "Upcoming"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Principle Disbursed</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">UGX {stats.totalPrincipal.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total principal amount</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">UGX {stats.totalRemaining.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Remaining balance (Principal + Interest)</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">UGX {stats.totalPaid.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total amount collected</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expected Return</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">UGX {stats.totalDisbursed.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Principal + 30% Interest</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Active Loans</CardTitle>
                        <CardDescription>
                          View all active loans and track growth. Use the search bar above to find a group, client, or product.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Group/Client</TableHead>
                            <TableHead>{viewMode === "list" ? "Leader" : "Members"}</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Remaining</TableHead>
                            <TableHead>Growth</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLoans.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                No active loans found
                              </TableCell>
                            </TableRow>
                          ) : (
                            (() => {
                              // If List View is selected, render all filtered loans directly
                              if (viewMode === "list") {
                                // Sort by creation date descending
                                const sortedLoans = [...filteredLoans].sort((a, b) =>
                                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                                );

                                return sortedLoans.map((loan) => {
                                  const paid = loan.amount_paid ?? 0;
                                  const total = loan.total_amount ?? 1;
                                  const progress = total > 0 ? (paid / total) * 100 : 0;
                                  const growthRate = loan.growth_rate ?? 0;
                                  const detailsPath = `/staff-dashboard/loans/details/${loan.id}`;
                                  return (
                                    <TableRow
                                      key={loan.id}
                                      className="cursor-pointer hover:bg-muted/50"
                                      onClick={() => navigate(detailsPath)}
                                    >
                                      <TableCell className="font-medium">{getLoanTitle(loan)}</TableCell>
                                      <TableCell>
                                        {isGroupLoanEntry(loan) ? loan.full_name : "-"}
                                      </TableCell>
                                      <TableCell>UGX {(loan.principal ?? 0).toLocaleString()}</TableCell>
                                      <TableCell>UGX {(loan.total_amount ?? 0).toLocaleString()}</TableCell>
                                      <TableCell>UGX {(loan.amount_paid ?? 0).toLocaleString()}</TableCell>
                                      <TableCell>UGX {(loan.remaining_balance ?? 0).toLocaleString()}</TableCell>
                                      <TableCell>
                                        <Badge variant="default" className="bg-green-600">
                                          {growthRate.toFixed(2)}%
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Progress value={progress} className="w-20" />
                                          <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                                        </div>
                                      </TableCell>
                                      <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => navigate(detailsPath)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                });
                              }

                              // Groups View Logic (Default)
                              // Group loans by group_id
                              const grouped = new Map<string, typeof filteredLoans>();
                              const individuals: typeof filteredLoans = [];

                              filteredLoans.forEach(loan => {
                                const groupName = getGroupName(loan);
                                const groupKey = loan.group_id || (groupName ? `name:${groupName}` : null);
                                if (groupKey) {
                                  const existing = grouped.get(groupKey) || [];
                                  grouped.set(groupKey, [...existing, loan]);
                                } else {
                                  individuals.push(loan);
                                }
                              });

                              // Separate groups with 2+ members from single-member groups
                              const actualGroups = Array.from(grouped.entries())
                                .filter(([_, members]) => members.length >= 2)
                                .map(([groupId, members]) => ({
                                  groupId,
                                  groupName: (members[0] as any).group_name || (members[0] as any).groups?.group_name || 'Unknown Group',
                                  members,
                                  totalPrincipal: members.reduce((sum, m) => sum + m.principal, 0),
                                  totalAmount: members.reduce((sum, m) => sum + m.total_amount, 0),
                                  totalPaid: members.reduce((sum, m) => sum + m.amount_paid, 0),
                                  totalRemaining: members.reduce((sum, m) => sum + m.remaining_balance, 0),
                                  memberCount: members.length,
                                }));

                              const singleMemberGroups = Array.from(grouped.entries())
                                .filter(([_, members]) => members.length === 1)
                                .flatMap(([_, members]) => members);

                              const allIndividuals = [...individuals, ...singleMemberGroups];

                              return (
                                <>
                                  {/* Render actual groups (2+ members) */}
                                  {actualGroups.map((group) => {
                                    const progress = (group.totalPaid / group.totalAmount) * 100;

                                    return (
                                      <TableRow
                                        key={group.groupId}
                                        className="cursor-pointer hover:bg-muted/50 font-medium"
                                        onClick={() => openGroupDialog(group.groupId, group.groupName, group.members)}
                                      >
                                        <TableCell className="font-bold">
                                          {group.groupName}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="secondary">{group.memberCount} members</Badge>
                                        </TableCell>
                                        <TableCell>UGX {group.totalPrincipal.toLocaleString()}</TableCell>
                                        <TableCell>UGX {group.totalAmount.toLocaleString()}</TableCell>
                                        <TableCell className="text-green-600 font-semibold">UGX {group.totalPaid.toLocaleString()}</TableCell>
                                        <TableCell>UGX {group.totalRemaining.toLocaleString()}</TableCell>
                                        <TableCell>
                                          <Badge variant="default" className="bg-green-600">
                                            30.00%
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Progress value={progress} className="w-20" />
                                            <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Button variant="ghost" size="sm">
                                            View Members
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}

                                  {/* Render individual loans (no group or single-member groups) */}
                                  {allIndividuals.map((loan) => {
                                    const paid = loan.amount_paid ?? 0;
                                    const total = loan.total_amount ?? 1;
                                    const progress = total > 0 ? (paid / total) * 100 : 0;
                                    const growthRate = loan.growth_rate ?? 0;
                                    const detailsPath = `/staff-dashboard/loans/details/${loan.id}`;
                                    return (
                                      <TableRow
                                        key={loan.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(detailsPath)}
                                      >
                                        <TableCell className="font-medium">{loan.full_name}</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>UGX {(loan.principal ?? 0).toLocaleString()}</TableCell>
                                        <TableCell>UGX {(loan.total_amount ?? 0).toLocaleString()}</TableCell>
                                        <TableCell>UGX {(loan.amount_paid ?? 0).toLocaleString()}</TableCell>
                                        <TableCell>UGX {(loan.remaining_balance ?? 0).toLocaleString()}</TableCell>
                                        <TableCell>
                                          <Badge variant="default" className="bg-green-600">
                                            {growthRate.toFixed(2)}%
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Progress value={progress} className="w-20" />
                                            <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                                          </div>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(detailsPath)}
                                          >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </>
                              );
                            })()
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Money Growth Tracking</CardTitle>
                        <CardDescription>Track how client money grows over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {filteredLoans.slice(0, 5).map((loan) => {
                            const principal = loan.principal ?? 0;
                            const growthRate = loan.growth_rate ?? 0;
                            const duration = loan.loan_duration_months ?? 1;
                            const monthsElapsed = loan.months_elapsed ?? 0;
                            const monthlyGrowth = duration > 0 ? growthRate / duration : 0;
                            const currentValue = principal + (principal * (growthRate / 100) * (duration > 0 ? monthsElapsed / duration : 0));
                            const progressPct = duration > 0 ? (monthsElapsed / duration) * 100 : 0;
                            return (
                              <div key={loan.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium">{loan.full_name}</div>
                                  <Badge variant="outline">{getLoanTitle(loan)}</Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Initial Investment:</span>
                                    <span className="font-medium">UGX {principal.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Current Value:</span>
                                    <span className="font-medium text-green-600">UGX {currentValue.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Projected Return:</span>
                                    <span className="font-medium text-primary">UGX {(loan.total_amount ?? 0).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Growth Rate:</span>
                                    <span className="font-medium">{growthRate.toFixed(2)}%</span>
                                  </div>
                                  <Progress value={progressPct} className="mt-2" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Loan Summary</CardTitle>
                        <CardDescription>Overview of loan portfolio</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Active Loans:</span>
                            <span className="font-bold">{loans.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Outstanding:</span>
                            <span className="font-bold">UGX {stats.totalRemaining.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Collection Rate:</span>
                            <span className="font-bold">
                              {stats.totalDisbursed > 0
                                ? ((stats.totalPaid / stats.totalDisbursed) * 100).toFixed(2)
                                : 0}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Average Loan Size:</span>
                            <span className="font-bold">
                              UGX {loans.length > 0 ? (stats.totalPrincipal / loans.length).toLocaleString() : 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Group Members Dialog */}
      <Dialog open={selectedGroup !== null} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedGroup?.groupName}</DialogTitle>
            <DialogDescription>
              Group members and their loan details
            </DialogDescription>
          </DialogHeader>

          {selectedGroup && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGroup.members.map((loan) => {
                    const paid = loan.amount_paid ?? 0;
                    const total = loan.total_amount ?? 1;
                    const progress = total > 0 ? (paid / total) * 100 : 0;
                    const detailsPath = `/staff-dashboard/loans/details/${loan.id}`;
                    return (
                      <TableRow
                        key={loan.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedGroup(null);
                          navigate(detailsPath);
                        }}
                      >
                        <TableCell className="font-medium">{loan.full_name}</TableCell>
                        <TableCell>UGX {(loan.principal ?? 0).toLocaleString()}</TableCell>
                        <TableCell>UGX {(loan.total_amount ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">UGX {(loan.amount_paid ?? 0).toLocaleString()}</TableCell>
                        <TableCell>UGX {(loan.remaining_balance ?? 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="w-20" />
                            <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGroup(null);
                              navigate(detailsPath);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Group Summary */}
              <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Principal</p>
                  <p className="text-lg font-bold">
                    UGX {selectedGroup.members.reduce((sum, m) => sum + (m.principal ?? 0), 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    UGX {selectedGroup.members.reduce((sum, m) => sum + (m.amount_paid ?? 0), 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Remaining</p>
                  <p className="text-lg font-bold">
                    UGX {selectedGroup.members.reduce((sum, m) => sum + (m.remaining_balance ?? 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ActiveLoans;

