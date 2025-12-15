import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Receipt, Search, Plus, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Repayments = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [repayments, setRepayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff-login");
      return;
    }
    loadRepayments();
  };

  const loadRepayments = async () => {
    try {
      const { data: loans, error } = await supabase
        .from("loan_applications")
        .select("*")
        .in("status", ["approved", "disbursed"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Generate repayment schedule from loans
      const repaymentRecords = (loans || []).flatMap((loan: any) => {
        const principal = loan.loan_amount;
        const interest = principal * 0.30;
        const totalAmount = principal + interest;
        const monthlyPayment = totalAmount / loan.loan_duration_months;
        const approvedDate = new Date(loan.approved_at || loan.created_at);
        
        const records = [];
        for (let i = 0; i < loan.loan_duration_months; i++) {
          const dueDate = new Date(approvedDate);
          dueDate.setMonth(dueDate.getMonth() + i + 1);
          const isPaid = new Date() > dueDate;
          
          records.push({
            id: `${loan.id}-${i}`,
            loan_id: loan.id,
            client_name: loan.full_name,
            amount: monthlyPayment,
            due_date: dueDate.toISOString(),
            status: isPaid ? "paid" : "pending",
            payment_date: isPaid ? dueDate.toISOString() : null,
          });
        }
        return records;
      });

      setRepayments(repaymentRecords);
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

  const totalDue = repayments.filter(r => r.status === "pending").reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = repayments.filter(r => r.status === "paid").reduce((sum, r) => sum + r.amount, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Repayments</h1>
                <p className="text-muted-foreground">Track and manage loan repayments</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Due</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {totalDue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Pending repayments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">UGX {totalPaid.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Collected repayments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalDue + totalPaid > 0 
                        ? ((totalPaid / (totalDue + totalPaid)) * 100).toFixed(1) 
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Payment collection rate</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Repayment Schedule</CardTitle>
                      <CardDescription>View all repayment records</CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search repayments..."
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
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repayments
                        .filter(r => 
                          !searchTerm || 
                          r.client_name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((repayment) => (
                          <TableRow key={repayment.id}>
                            <TableCell className="font-medium">{repayment.client_name}</TableCell>
                            <TableCell>UGX {repayment.amount.toLocaleString()}</TableCell>
                            <TableCell>{new Date(repayment.due_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs ${
                                repayment.status === "paid" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {repayment.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {repayment.payment_date 
                                ? new Date(repayment.payment_date).toLocaleDateString()
                                : "-"
                              }
                            </TableCell>
                            <TableCell>
                              {repayment.status === "pending" && (
                                <Button variant="outline" size="sm">Record Payment</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Repayments;

