import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Users, Plus, Search, CheckCircle, XCircle, Clock, Eye, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoanApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  loan_product: string;
  loan_amount: number;
  loan_duration_months: number;
  status: string;
  created_at: string;
  group_id?: string;
  group_name?: string;
  group_members?: number;
}

const LoanApplications = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LoanApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Determine status filter from URL path
  const getStatusFromPath = () => {
    const path = location.pathname;
    if (path.includes("/pending")) return "pending";
    if (path.includes("/approved")) return "approved";
    if (path.includes("/rejected")) return "rejected";
    return "all";
  };
  
  const [statusFilter, setStatusFilter] = useState<string>(getStatusFromPath());
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Group loan form state
  const [groupForm, setGroupForm] = useState({
    group_name: "",
    group_leader_name: "",
    group_leader_email: "",
    group_leader_phone: "",
    group_leader_id: "",
    loan_amount: "",
    loan_duration_months: "",
    loan_purpose: "",
    group_members: [{ name: "", email: "", phone: "", id_number: "" }],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Update status filter when route changes
  useEffect(() => {
    const newStatus = getStatusFromPath();
    setStatusFilter(newStatus);
  }, [location.pathname]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff-login");
      return;
    }
    loadApplications();
  };

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("loan_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group applications by group_id if they exist
      const grouped = data?.map((app: any) => ({
        ...app,
        group_id: app.group_id || null,
      })) || [];

      setApplications(grouped);
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

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.phone_number.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "approved") {
        // Include both approved and disbursed loans
        filtered = filtered.filter((app) => 
          app.status === "approved" || app.status === "disbursed"
        );
      } else {
        filtered = filtered.filter((app) => app.status === statusFilter);
      }
    }

    setFilteredApplications(filtered);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string, rejectionReason?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "approved") {
        updateData.approved_at = new Date().toISOString();
        updateData.reviewed_at = new Date().toISOString();
      } else if (newStatus === "rejected") {
        updateData.rejection_reason = rejectionReason || "Application rejected";
        updateData.reviewed_at = new Date().toISOString();
      } else if (newStatus === "under_review") {
        updateData.reviewed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("loan_applications")
        .update(updateData)
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${newStatus} successfully`,
      });

      loadApplications();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateGroupLoanDetails = (amount: number, duration: number) => {
    const principal = amount;
    const interestRate = 0.30; // 30% flat rate
    const totalInterest = principal * interestRate;
    const totalAmount = principal + totalInterest;
    const monthlyPayment = totalAmount / duration;
    const growthRate = ((totalAmount - principal) / principal) * 100;

    return {
      principal,
      interestRate: interestRate * 100,
      totalInterest,
      totalAmount,
      monthlyPayment,
      growthRate,
    };
  };

  const handleGroupLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loanAmount = parseFloat(groupForm.loan_amount);
      const duration = parseInt(groupForm.loan_duration_months);

      if (!loanAmount || !duration) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Create group loan application
      const { data: groupLeader, error: leaderError } = await supabase.auth.admin.createUser({
        email: groupForm.group_leader_email,
        password: "temp_password_123", // Should be changed on first login
        user_metadata: {
          full_name: groupForm.group_leader_name,
          phone_number: groupForm.group_leader_phone,
        },
      });

      if (leaderError && leaderError.message !== "User already registered") {
        throw leaderError;
      }

      // Create loan application for group leader
      const { data: application, error: appError } = await supabase
        .from("loan_applications")
        .insert({
          user_id: groupLeader?.user?.id || "",
          full_name: groupForm.group_leader_name,
          email: groupForm.group_leader_email,
          phone_number: groupForm.group_leader_phone,
          id_number: groupForm.group_leader_id,
          loan_product: "Group Loan",
          loan_amount: loanAmount,
          loan_duration_months: duration,
          loan_purpose: groupForm.loan_purpose,
          status: "pending",
          date_of_birth: new Date().toISOString(),
          address: "",
          employment_status: "Group Member",
        })
        .select()
        .single();

      if (appError) throw appError;

      toast({
        title: "Success",
        description: "Group loan application created successfully",
      });

      setIsGroupDialogOpen(false);
      loadApplications();
      setGroupForm({
        group_name: "",
        group_leader_name: "",
        group_leader_email: "",
        group_leader_phone: "",
        group_leader_id: "",
        loan_amount: "",
        loan_duration_months: "",
        loan_purpose: "",
        group_members: [{ name: "", email: "", phone: "", id_number: "" }],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      under_review: { variant: "secondary", label: "Under Review" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      disbursed: { variant: "default", label: "Disbursed" },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const loanDetails = selectedApplication
    ? calculateGroupLoanDetails(selectedApplication.loan_amount, selectedApplication.loan_duration_months)
    : null;

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
                  <h1 className="text-3xl font-bold mb-2">Loan Applications</h1>
                  <p className="text-muted-foreground">Manage and review loan applications</p>
                </div>
                <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Group Loan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Group Loan Application</DialogTitle>
                      <DialogDescription>
                        Create a new group loan application. Group loans use a 30% flat interest rate.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleGroupLoanSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Group Name</Label>
                          <Input
                            value={groupForm.group_name}
                            onChange={(e) => setGroupForm({ ...groupForm, group_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Loan Amount (UGX)</Label>
                          <Input
                            type="number"
                            value={groupForm.loan_amount}
                            onChange={(e) => setGroupForm({ ...groupForm, loan_amount: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Loan Duration (Months)</Label>
                          <Input
                            type="number"
                            value={groupForm.loan_duration_months}
                            onChange={(e) => setGroupForm({ ...groupForm, loan_duration_months: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Loan Purpose</Label>
                          <Input
                            value={groupForm.loan_purpose}
                            onChange={(e) => setGroupForm({ ...groupForm, loan_purpose: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Group Leader Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Full Name</Label>
                            <Input
                              value={groupForm.group_leader_name}
                              onChange={(e) => setGroupForm({ ...groupForm, group_leader_name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={groupForm.group_leader_email}
                              onChange={(e) => setGroupForm({ ...groupForm, group_leader_email: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Phone Number</Label>
                            <Input
                              value={groupForm.group_leader_phone}
                              onChange={(e) => setGroupForm({ ...groupForm, group_leader_phone: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>ID Number</Label>
                            <Input
                              value={groupForm.group_leader_id}
                              onChange={(e) => setGroupForm({ ...groupForm, group_leader_id: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Application</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Status Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications")}
                  className="rounded-b-none"
                >
                  All Applications
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/pending")}
                  className="rounded-b-none"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "approved" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/approved")}
                  className="rounded-b-none"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approved
                </Button>
                <Button
                  variant={statusFilter === "rejected" ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/applications/rejected")}
                  className="rounded-b-none"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejected
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Applications</CardTitle>
                      <CardDescription>View and manage loan applications</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search applications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-64"
                        />
                      </div>
                      <Select 
                        value={statusFilter} 
                        onValueChange={(value) => {
                          setStatusFilter(value);
                          // Navigate to the appropriate route
                          if (value === "pending") {
                            navigate("/staff-dashboard/applications/pending");
                          } else if (value === "approved") {
                            navigate("/staff-dashboard/applications/approved");
                          } else if (value === "rejected") {
                            navigate("/staff-dashboard/applications/rejected");
                          } else {
                            navigate("/staff-dashboard/applications");
                          }
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="disbursed">Disbursed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{app.full_name}</div>
                                <div className="text-sm text-muted-foreground">{app.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{app.loan_product}</TableCell>
                            <TableCell>UGX {app.loan_amount.toLocaleString()}</TableCell>
                            <TableCell>{app.loan_duration_months} months</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {app.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStatusChange(app.id, "approved")}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleStatusChange(app.id, "rejected")}
                                    >
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Application Details</DialogTitle>
                  </DialogHeader>
                  {selectedApplication && loanDetails && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Applicant Name</Label>
                          <p className="font-medium">{selectedApplication.full_name}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="font-medium">{selectedApplication.email}</p>
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <p className="font-medium">{selectedApplication.phone_number}</p>
                        </div>
                        <div>
                          <Label>Loan Product</Label>
                          <p className="font-medium">{selectedApplication.loan_product}</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Loan Calculation (30% Flat Rate)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">Principal Amount</div>
                              <div className="text-2xl font-bold">UGX {loanDetails.principal.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">Total Interest (30%)</div>
                              <div className="text-2xl font-bold">UGX {loanDetails.totalInterest.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">Total Amount</div>
                              <div className="text-2xl font-bold text-primary">UGX {loanDetails.totalAmount.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">Monthly Payment</div>
                              <div className="text-2xl font-bold">UGX {loanDetails.monthlyPayment.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                        </div>
                        <Card className="mt-4 bg-primary/10">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-muted-foreground">Money Growth Rate</div>
                                <div className="text-2xl font-bold text-primary">{loanDetails.growthRate.toFixed(2)}%</div>
                              </div>
                              <DollarSign className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Your money grows by {loanDetails.growthRate.toFixed(2)}% over {selectedApplication.loan_duration_months} months
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Close
                        </Button>
                        {selectedApplication.status === "pending" && (
                          <>
                            <Button onClick={() => handleStatusChange(selectedApplication.id, "approved")}>
                              Approve
                            </Button>
                            <Button variant="destructive" onClick={() => handleStatusChange(selectedApplication.id, "rejected")}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LoanApplications;

