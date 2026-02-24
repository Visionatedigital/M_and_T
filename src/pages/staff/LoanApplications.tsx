import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, isSupabaseOffline } from "@/integrations/supabase/client";
import { api } from "@/services/api";
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
import { FileText, Plus, Search, CheckCircle, XCircle, Clock, Eye, DollarSign } from "lucide-react";
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
  branch_name?: string;
  loan_type?: string;
  loan_category?: string;
  id_number?: string;
  district?: string;
  division?: string;
  county?: string;
  village?: string;
  parish?: string;
  business_location?: string;
  attachments?: string | null;
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

  const initialFormState = {
    branch_name: "Kasangati Branch",
    loan_type: "Business",
    loan_category: "Individual Loan (1 Month)",
    group_name: "",
    group_leader_name: "",
    group_leader_email: "",
    group_leader_phone: "",
    group_leader_id: "",
    district: "",
    division: "",
    county: "",
    village: "",
    parish: "",
    business_location: "",
    loan_amount: "",
    loan_duration_months: "",
    loan_purpose: "",
    attachments: {} as Record<string, { name: string; data: string }>,
  };

  const [groupForm, setGroupForm] = useState(initialFormState);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupForm((prev) => ({
          ...prev,
          attachments: {
            ...prev.attachments,
            [fieldName]: { name: file.name, data: reader.result as string },
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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
    try {
      // 1. If offline mode, prioritize local check
      if (isSupabaseOffline) {
        try {
          const user = await api.auth.getMe();
          if (user) {
            loadApplications();
            return;
          }
        } catch (e) {
          console.warn("No local session found");
        }
        navigate("/staff-login");
        return;
      }

      // 2. Online mode: Try Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        loadApplications();
        return;
      }

      navigate("/staff-login");
    } catch (error) {
      console.error("Auth check failed:", error);
      // Fallback for offline mode if Supabase fails
      if (isSupabaseOffline) {
        try {
          const user = await api.auth.getMe();
          if (user) {
            loadApplications();
            return;
          }
        } catch (e) { }
      }
      navigate("/staff-login");
    }
  };

  const loadApplications = async () => {
    try {
      let data = [];

      if (isSupabaseOffline) {
        console.log("🛠️ Loading applications from local API...");
        data = await api.applications.getAll();
      } else {
        const { data: supabaseData, error } = await supabase
          .from("loan_applications")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        data = supabaseData || [];
      }

      // Group applications by group_id if they exist
      const grouped = data.map((app: any) => ({
        ...app,
        group_id: app.group_id || null,
      }));

      setApplications(grouped);
    } catch (error: any) {
      console.error("Load applications error:", error);
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
      if (isSupabaseOffline) {
        await api.applications.updateStatus(applicationId, newStatus);
      } else {
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
      }

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

  const calculateLoanDetails = (amount: number, duration: number, rate: number = 0.20) => {
    const principal = amount;
    const interestRate = rate; // Configurable interest rate
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

  const handleLoanSubmit = async (e: React.FormEvent) => {
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

      if (isSupabaseOffline) {
        await api.applications.create({
          full_name: groupForm.group_leader_name,
          email: groupForm.group_leader_email,
          phone_number: groupForm.group_leader_phone,
          id_number: groupForm.group_leader_id,
          loan_product: groupForm.loan_category,
          loan_amount: loanAmount,
          loan_duration_months: duration,
          loan_purpose: groupForm.loan_purpose,
          branch_name: groupForm.branch_name,
          loan_type: groupForm.loan_type,
          loan_category: groupForm.loan_category,
          group_name: groupForm.group_name,
          district: groupForm.district,
          division: groupForm.division,
          county: groupForm.county,
          village: groupForm.village,
          parish: groupForm.parish,
          business_location: groupForm.business_location,
          attachments: JSON.stringify(groupForm.attachments),
        });
      } else {
        // Create individual loan application
        const { data: borrower, error: borrowerError } = await supabase.auth.admin.createUser({
          email: groupForm.group_leader_email,
          password: "temp_password_123", // Should be changed on first login
          user_metadata: {
            full_name: groupForm.group_leader_name,
            phone_number: groupForm.group_leader_phone,
          },
        });

        if (borrowerError && borrowerError.message !== "User already registered") {
          throw borrowerError;
        }

        // Create loan application for individual borrower
        const { data: application, error: appError } = await supabase
          .from("loan_applications")
          .insert({
            user_id: borrower?.user?.id || "",
            full_name: groupForm.group_leader_name,
            email: groupForm.group_leader_email,
            phone_number: groupForm.group_leader_phone,
            id_number: groupForm.group_leader_id,
            loan_product: groupForm.loan_category,
            loan_amount: loanAmount,
            loan_duration_months: duration,
            loan_purpose: groupForm.loan_purpose,
            status: "pending",
            date_of_birth: new Date().toISOString(),
            address: `${groupForm.district}, ${groupForm.division}`,
            employment_status: "Employed",
            branch_name: groupForm.branch_name,
            loan_type: groupForm.loan_type,
            loan_category: groupForm.loan_category,
            group_name: groupForm.group_name,
            district: groupForm.district,
            division: groupForm.division,
            county: groupForm.county,
            village: groupForm.village,
            parish: groupForm.parish,
            business_location: groupForm.business_location,
            attachments: JSON.stringify(groupForm.attachments),
          })
          .select()
          .single();

        if (appError) throw appError;
      }

      toast({
        title: "Success",
        description: "Loan application created successfully",
      });

      setIsGroupDialogOpen(false);
      loadApplications();
      setGroupForm(initialFormState);
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
    ? calculateLoanDetails(selectedApplication.loan_amount, selectedApplication.loan_duration_months)
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
                      New Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Loan Application</DialogTitle>
                      <DialogDescription>
                        Create a new individual loan application with flexible interest rates.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLoanSubmit} className="space-y-6">

                      <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Loan Application Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Branch Name</Label>
                            <Select value={groupForm.branch_name} onValueChange={(val) => setGroupForm({ ...groupForm, branch_name: val })}>
                              <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Kasangati Branch">Kasangati Branch</SelectItem>
                                <SelectItem value="Kampala Central">Kampala Central</SelectItem>
                                <SelectItem value="Mbarara Branch">Mbarara Branch</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Loan Type</Label>
                            <Select value={groupForm.loan_type} onValueChange={(val) => setGroupForm({ ...groupForm, loan_type: val })}>
                              <SelectTrigger><SelectValue placeholder="Select Loan Type" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Agricultural">Agricultural</SelectItem>
                                <SelectItem value="School Fees">School Fees</SelectItem>
                                <SelectItem value="Emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Loan Category</Label>
                            <Select value={groupForm.loan_category} onValueChange={(val) => setGroupForm({ ...groupForm, loan_category: val })}>
                              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Group Loan (4 Months)">Group Loan (4 Months)</SelectItem>
                                <SelectItem value="Individual Loan (1 Month)">Individual Loan (1 Month)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Amount Applied (UGX)</Label>
                            <Input
                              type="number"
                              value={groupForm.loan_amount}
                              onChange={(e) => setGroupForm({ ...groupForm, loan_amount: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Duration (Months)</Label>
                            <Input
                              type="number"
                              value={groupForm.loan_duration_months}
                              onChange={(e) => setGroupForm({ ...groupForm, loan_duration_months: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Purpose of Loan</Label>
                            <Input
                              value={groupForm.loan_purpose}
                              onChange={(e) => setGroupForm({ ...groupForm, loan_purpose: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Group Name (If applicable)</Label>
                            <Input
                              value={groupForm.group_name}
                              onChange={(e) => setGroupForm({ ...groupForm, group_name: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Borrower Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label>Full Name</Label>
                            <Input
                              value={groupForm.group_leader_name}
                              onChange={(e) => setGroupForm({ ...groupForm, group_leader_name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>National ID Number</Label>
                            <Input
                              value={groupForm.group_leader_id}
                              onChange={(e) => setGroupForm({ ...groupForm, group_leader_id: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label>Telephone Contact</Label>
                            <Input
                              value={groupForm.group_leader_phone}
                              onChange={(e) => setGroupForm({ ...groupForm, group_leader_phone: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={groupForm.group_leader_email}
                              onChange={(e) => setGroupForm({ ...groupForm, group_leader_email: e.target.value })}
                              required
                            />
                          </div>

                          <div className="col-span-2 text-sm font-medium mt-2">Physical Address:</div>
                          <div>
                            <Label>District</Label>
                            <Input value={groupForm.district} onChange={(e) => setGroupForm({ ...groupForm, district: e.target.value })} required />
                          </div>
                          <div>
                            <Label>Division</Label>
                            <Input value={groupForm.division} onChange={(e) => setGroupForm({ ...groupForm, division: e.target.value })} required />
                          </div>
                          <div>
                            <Label>County</Label>
                            <Input value={groupForm.county} onChange={(e) => setGroupForm({ ...groupForm, county: e.target.value })} required />
                          </div>
                          <div>
                            <Label>Village</Label>
                            <Input value={groupForm.village} onChange={(e) => setGroupForm({ ...groupForm, village: e.target.value })} required />
                          </div>
                          <div>
                            <Label>Parish</Label>
                            <Input value={groupForm.parish} onChange={(e) => setGroupForm({ ...groupForm, parish: e.target.value })} required />
                          </div>
                          <div className="col-span-2 mt-2">
                            <Label>Business Location (if applicable)</Label>
                            <Input value={groupForm.business_location} onChange={(e) => setGroupForm({ ...groupForm, business_location: e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-2">Attachments</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Photocopy of National ID</Label>
                            <Input type="file" onChange={(e) => handleFileUpload(e, 'national_id')} accept="image/*,.pdf" />
                          </div>
                          <div>
                            <Label>LC1 Recommendation Letter</Label>
                            <Input type="file" onChange={(e) => handleFileUpload(e, 'lc1_letter')} accept="image/*,.pdf" />
                          </div>
                          <div>
                            <Label>Recommendation Letter (Chairperson/Boda)</Label>
                            <Input type="file" onChange={(e) => handleFileUpload(e, 'chairperson_letter')} accept="image/*,.pdf" />
                          </div>
                          <div>
                            <Label>Passport Size Photo</Label>
                            <Input type="file" onChange={(e) => handleFileUpload(e, 'passport_photo')} accept="image/*" />
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <Label>Detailed Monthly Income & Expenditure</Label>
                            <Input type="file" onChange={(e) => handleFileUpload(e, 'income_statement')} accept="image/*,.pdf,.doc,.docx" />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Complete Application</Button>
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
                          <Label>National ID</Label>
                          <p className="font-medium">{selectedApplication.id_number || 'N/A'}</p>
                        </div>
                        <div>
                          <Label>Branch</Label>
                          <p className="font-medium">{selectedApplication.branch_name || 'N/A'}</p>
                        </div>
                        <div>
                          <Label>Loan Category</Label>
                          <p className="font-medium">{selectedApplication.loan_category || selectedApplication.loan_product}</p>
                        </div>
                        <div>
                          <Label>Business Location</Label>
                          <p className="font-medium">{selectedApplication.business_location || 'N/A'}</p>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <p className="font-medium text-sm">
                            {(selectedApplication.district || selectedApplication.division)
                              ? `${selectedApplication.district}, ${selectedApplication.division} - ${selectedApplication.village}`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Attachments Section */}
                      {selectedApplication.attachments && selectedApplication.attachments !== "{}" && (
                        <div className="border-t pt-4">
                          <h3 className="font-semibold mb-2">Attachments</h3>
                          <div className="flex flex-col gap-2">
                            {Object.entries(JSON.parse(selectedApplication.attachments)).map(([key, attachment]: [string, any]) => (
                              <div key={key} className="flex items-center justify-between border rounded p-2 text-sm bg-muted/20">
                                <span className="font-medium truncate mr-2">{attachment.name || key}</span>
                                <Button size="sm" variant="secondary" onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = attachment.data;
                                  link.download = attachment.name;
                                  link.click();
                                }}>Download / View</Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Loan Calculation (20% Default Rate)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">Principal Amount</div>
                              <div className="text-2xl font-bold">UGX {loanDetails.principal.toLocaleString()}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground">Total Interest (20%)</div>
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

