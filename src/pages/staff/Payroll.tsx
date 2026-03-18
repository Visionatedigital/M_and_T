import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Receipt, Wallet, FileText, Plus, Loader2 } from "lucide-react";

const Payroll = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payrollContracts, setPayrollContracts] = useState<any[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<any[]>([]);
  const [payrollUsers, setPayrollUsers] = useState<any[]>([]);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractForm, setContractForm] = useState({ user_id: "", base_salary: "", allowances: "", nssf_contribution: "", paye_tax: "" });
  const [processMonth, setProcessMonth] = useState(new Date().getMonth() + 1);
  const [processYear, setProcessYear] = useState(new Date().getFullYear());
  const [salaryPaymentMethod, setSalaryPaymentMethod] = useState("bank_transfer");
  const [payrollProcessing, setPayrollProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPayrollData = useCallback(async () => {
    try {
      const [contracts, history, users] = await Promise.all([
        api.payroll.getContracts(),
        api.payroll.getHistory(),
        api.users.getAll(),
      ]);
      setPayrollContracts(contracts || []);
      setPayrollHistory(history || []);
      setPayrollUsers(users || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error loading payroll data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.auth.getMe();
        loadPayrollData();
      } catch {
        navigate("/staff-login");
      }
    };
    checkAuth();
  }, [navigate, loadPayrollData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffHeader />
          <main className="flex-1 p-6 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="h-6 w-6 text-primary" />
                  Payroll
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Manage staff contracts and process payroll</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        Staff Contracts
                      </CardTitle>
                      <CardDescription>Manage salary contracts for staff</CardDescription>
                    </div>
                    <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Contract</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add / Edit Staff Contract</DialogTitle></DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          if (!contractForm.user_id || !contractForm.base_salary) {
                            toast({ title: "Select staff and enter base salary", variant: "destructive" });
                            return;
                          }
                          try {
                            await api.payroll.saveContract({
                              user_id: contractForm.user_id,
                              base_salary: parseFloat(contractForm.base_salary),
                              allowances: parseFloat(contractForm.allowances || "0"),
                              nssf_contribution: parseFloat(contractForm.nssf_contribution || "0"),
                              paye_tax: parseFloat(contractForm.paye_tax || "0"),
                            });
                            toast({ title: "Contract saved ✓" });
                            setContractDialogOpen(false);
                            setContractForm({ user_id: "", base_salary: "", allowances: "", nssf_contribution: "", paye_tax: "" });
                            loadPayrollData();
                          } catch (err: any) {
                            toast({ title: err.message || "Failed to save", variant: "destructive" });
                          }
                        }} className="space-y-4 mt-2">
                          <div>
                            <Label>Staff *</Label>
                            <Select value={contractForm.user_id} onValueChange={v => setContractForm(f => ({ ...f, user_id: v }))}>
                              <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                              <SelectContent>
                                {payrollUsers.map((u: any) => (
                                  <SelectItem key={u.id} value={u.id}>{u.full_name || u.email} ({u.email})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Base Salary (UGX) *</Label>
                            <Input type="number" min="0" value={contractForm.base_salary} onChange={e => setContractForm(f => ({ ...f, base_salary: e.target.value }))} />
                          </div>
                          <div>
                            <Label>Allowances (UGX)</Label>
                            <Input type="number" min="0" value={contractForm.allowances} onChange={e => setContractForm(f => ({ ...f, allowances: e.target.value }))} />
                          </div>
                          <div>
                            <Label>NSSF Contribution (UGX)</Label>
                            <Input type="number" min="0" value={contractForm.nssf_contribution} onChange={e => setContractForm(f => ({ ...f, nssf_contribution: e.target.value }))} />
                          </div>
                          <div>
                            <Label>PAYE Tax (UGX)</Label>
                            <Input type="number" min="0" value={contractForm.paye_tax} onChange={e => setContractForm(f => ({ ...f, paye_tax: e.target.value }))} />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setContractDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="flex-1">Save Contract</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs font-semibold">Staff</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Base</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Allowances</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Net Est.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollContracts.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No contracts. Add a staff contract to process payroll.</TableCell></TableRow>
                      ) : payrollContracts.map((c: any) => {
                        const gross = parseFloat(c.base_salary || 0) + parseFloat(c.allowances || 0);
                        const net = gross - parseFloat(c.nssf_contribution || 0) - parseFloat(c.paye_tax || 0);
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="text-sm font-medium">{c.full_name || c.email}</TableCell>
                            <TableCell className="text-sm text-right">{Number(c.base_salary).toLocaleString()}</TableCell>
                            <TableCell className="text-sm text-right">{Number(c.allowances || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-sm text-right font-medium">{net.toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-emerald-500" />
                      Process Payroll
                    </CardTitle>
                    <CardDescription>Generate payroll records for a month</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 items-end">
                      <div>
                        <Label className="text-xs">Month</Label>
                        <Select value={String(processMonth)} onValueChange={v => setProcessMonth(parseInt(v, 10))}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                              <SelectItem key={m} value={String(m)}>{new Date(2000, m - 1).toLocaleString("default", { month: "long" })}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Year</Label>
                        <Input type="number" min="2020" max="2030" value={processYear} onChange={e => setProcessYear(parseInt(e.target.value, 10) || new Date().getFullYear())} className="w-24" />
                      </div>
                      <Button
                        size="sm"
                        disabled={payrollProcessing || payrollContracts.length === 0}
                        onClick={async () => {
                          setPayrollProcessing(true);
                          try {
                            await api.payroll.process({ month: processMonth, year: processYear });
                            toast({ title: "Payroll processed ✓" });
                            loadPayrollData();
                          } catch (err: any) {
                            toast({ title: err.message || "Failed to process", variant: "destructive" });
                          } finally {
                            setPayrollProcessing(false);
                          }
                        }}
                      >
                        {payrollProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Process
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-500" />
                    Payroll History
                  </CardTitle>
                  <CardDescription>Records created when processing payroll. Mark as paid to record in accounting.</CardDescription>
                  <div className="pt-2 max-w-xs">
                    <Label className="text-xs mb-1 block">Payment Method for "Mark as Paid"</Label>
                    <Select value={salaryPaymentMethod} onValueChange={setSalaryPaymentMethod}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Staff</TableHead>
                      <TableHead className="text-xs font-semibold">Period</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Gross</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Net</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollHistory.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">No payroll records. Process payroll first.</TableCell></TableRow>
                    ) : payrollHistory.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm font-medium">{r.full_name}</TableCell>
                        <TableCell className="text-sm">{r.period_month}/{r.period_year}</TableCell>
                        <TableCell className="text-sm text-right">{Number(r.gross_salary).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-right font-medium">{Number(r.net_salary).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={r.payment_status === "paid" ? "default" : "secondary"}>
                            {r.payment_status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {r.payment_status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await api.payroll.markAsPaid(r.id, { payment_method: salaryPaymentMethod });
                                  toast({ title: "Payment recorded ✓" });
                                  loadPayrollData();
                                } catch (err: any) {
                                  toast({ title: err.message || "Failed", variant: "destructive" });
                                }
                              }}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Payroll;
