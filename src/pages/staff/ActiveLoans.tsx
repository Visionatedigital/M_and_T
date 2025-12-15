import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Wallet, Search, TrendingUp, DollarSign, Calendar, Users } from "lucide-react";
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
}

const ActiveLoans = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<ActiveLoan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff-login");
      return;
    }
    loadActiveLoans();
  };

  const loadActiveLoans = async () => {
    try {
      const { data, error } = await supabase
        .from("loan_applications")
        .select("*")
        .in("status", ["approved", "disbursed"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedLoans = (data || []).map((loan: any) => {
        const principal = loan.loan_amount;
        const interestRate = 0.30; // 30% flat rate
        const totalInterest = principal * interestRate;
        const totalAmount = principal + totalInterest;
        
        // Calculate time elapsed
        const approvedDate = new Date(loan.approved_at || loan.created_at);
        const now = new Date();
        const monthsElapsed = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const monthsRemaining = Math.max(0, loan.loan_duration_months - monthsElapsed);
        
        // Calculate payments (assuming equal monthly payments)
        const monthlyPayment = totalAmount / loan.loan_duration_months;
        const amountPaid = monthlyPayment * monthsElapsed;
        const remainingBalance = Math.max(0, totalAmount - amountPaid);
        
        // Calculate growth
        const growthRate = ((totalAmount - principal) / principal) * 100;
        const currentGrowth = ((amountPaid - (principal * (monthsElapsed / loan.loan_duration_months))) / principal) * 100;

        return {
          ...loan,
          principal,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          remaining_balance: remainingBalance,
          growth_rate: growthRate,
          months_elapsed: monthsElapsed,
          months_remaining: monthsRemaining,
          current_growth: currentGrowth,
        };
      });

      setLoans(processedLoans);
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

  const filterLoans = () => {
    let filtered = loans;

    if (searchTerm) {
      filtered = filtered.filter(
        (loan) =>
          loan.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.loan_product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLoans(filtered);
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
              <div>
                <h1 className="text-3xl font-bold mb-2">Active Loans</h1>
                <p className="text-muted-foreground">Track active loans and money growth</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Principal</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {stats.totalPrincipal.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total loan principal</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {stats.totalDisbursed.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Including 30% interest</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {stats.totalPaid.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Amount collected</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Growth Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.avgGrowth.toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">Average money growth</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Loans</CardTitle>
                      <CardDescription>View all active loans and track growth</CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search loans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Growth</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No active loans found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLoans.map((loan) => {
                          const progress = (loan.amount_paid / loan.total_amount) * 100;
                          return (
                            <TableRow key={loan.id}>
                              <TableCell className="font-medium">{loan.full_name}</TableCell>
                              <TableCell>{loan.loan_product}</TableCell>
                              <TableCell>UGX {loan.principal.toLocaleString()}</TableCell>
                              <TableCell>UGX {loan.total_amount.toLocaleString()}</TableCell>
                              <TableCell>UGX {loan.amount_paid.toLocaleString()}</TableCell>
                              <TableCell>UGX {loan.remaining_balance.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant="default" className="bg-green-600">
                                  {loan.growth_rate.toFixed(2)}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={progress} className="w-20" />
                                  <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
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
                        const monthlyGrowth = loan.growth_rate / loan.loan_duration_months;
                        const currentValue = loan.principal + (loan.principal * (loan.growth_rate / 100) * (loan.months_elapsed / loan.loan_duration_months));
                        return (
                          <div key={loan.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{loan.full_name}</div>
                              <Badge variant="outline">{loan.loan_product}</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Initial Investment:</span>
                                <span className="font-medium">UGX {loan.principal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Current Value:</span>
                                <span className="font-medium text-green-600">UGX {currentValue.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Projected Return:</span>
                                <span className="font-medium text-primary">UGX {loan.total_amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Growth Rate:</span>
                                <span className="font-medium">{loan.growth_rate.toFixed(2)}%</span>
                              </div>
                              <Progress value={(loan.months_elapsed / loan.loan_duration_months) * 100} className="mt-2" />
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
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ActiveLoans;

