import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, isSupabaseOffline } from "@/integrations/supabase/client";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Plus, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Collateral {
  id: string;
  loan_application_id: string | null;
  type: string;
  description: string;
  estimated_value: number;
  current_value: number | null;
  status: string;
  location: string | null;
  registration_number: string | null;
  notes: string | null;
  loan_client_name?: string;
  has_insurance?: boolean;
}

const CollateralAssets = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [collateral, setCollateral] = useState<Collateral[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collateralForm, setCollateralForm] = useState({
    loan_application_id: "",
    type: "Property",
    description: "",
    estimated_value: "",
    location: "",
    registration_number: "",
  });
  const [activeLoans, setActiveLoans] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. If offline mode, prioritize local check
      if (isSupabaseOffline) {
        try {
          const user = await api.auth.getMe();
          if (user) {
            loadCollateral();
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
        loadCollateral();
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
            loadCollateral();
            return;
          }
        } catch (e) { }
      }
      navigate("/staff-login");
    }
  };

  const loadCollateral = async () => {
    try {
      let collateralData = [];
      let loanData: any[] = [];
      let insuranceData: any[] = [];

      if (isSupabaseOffline) {
        console.log("🛠️ Loading collateral from local API...");
        try {
          collateralData = await api.collateral.getAll() || [];
          loanData = await api.applications.getAll() || [];
          // insuranceData might be empty or mock
        } catch (e) {
          console.warn("Failed to fetch collateral in offline mode");
        }
      } else {
        // Load collateral
        const { data: cData, error: collateralError } = await supabase
          .from("collateral")
          .select("*")
          .order("created_at", { ascending: false });

        if (collateralError) throw collateralError;
        collateralData = cData || [];

        // Load insurance data
        const { data: iData, error: insuranceError } = await supabase
          .from("collateral_insurance")
          .select("collateral_id, status")
          .eq("status", "active");

        if (insuranceError) throw insuranceError;
        insuranceData = iData || [];

        // Load loan applications to get client names
        const loanIds = collateralData
          .map(c => c.loan_application_id)
          .filter(Boolean) as string[];

        if (loanIds.length > 0) {
          const { data: loans, error: loansError } = await supabase
            .from("loan_applications")
            .select("id, full_name")
            .in("id", loanIds);

          if (!loansError && loans) {
            loanData = loans;
          }
        }
      }

      // Enrich collateral data
      const enrichedCollateral = (collateralData || []).map((item: any) => {
        const loan = loanData.find(l => l.id === item.loan_application_id);
        const hasInsurance = insuranceData?.some(i => i.collateral_id === item.id) || false;

        return {
          ...item,
          loan_client_name: loan?.full_name || "N/A",
          has_insurance: hasInsurance,
        };
      });

      setCollateral(enrichedCollateral);

      // Load active loans for dropdown
      if (isSupabaseOffline) {
        setActiveLoans(loanData);
      } else {
        const { data } = await supabase.from("loan_applications").select("id, full_name");
        setActiveLoans(data || []);
      }
    } catch (error: any) {
      console.error("Load collateral error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollateralSubmit = async () => {
    try {
      if (!collateralForm.loan_application_id || !collateralForm.type || !collateralForm.estimated_value) {
        toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
        return;
      }

      const data = {
        loan_application_id: collateralForm.loan_application_id,
        type: collateralForm.type,
        description: collateralForm.description,
        estimated_value: parseFloat(collateralForm.estimated_value),
        location: collateralForm.location,
        registration_number: collateralForm.registration_number,
      };

      if (isSupabaseOffline) {
        await api.collateral.create(data);
      } else {
        const { error } = await supabase.from("collateral").insert(data);
        if (error) throw error;
      }

      toast({ title: "Success", description: "Collateral added successfully" });
      setIsDialogOpen(false);
      loadCollateral();
      setCollateralForm({
        loan_application_id: "",
        type: "Property",
        description: "",
        estimated_value: "",
        location: "",
        registration_number: "",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Collateral & Assets</h1>
                  <p className="text-muted-foreground">Manage collateral and asset valuations</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={!location.pathname.includes("/valuations") && !location.pathname.includes("/insurance") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/collateral")}
                  className="rounded-b-none"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Collateral Register
                </Button>
                <Button
                  variant={location.pathname.includes("/valuations") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/collateral/valuations")}
                  className="rounded-b-none"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Asset Valuations
                </Button>
                <Button
                  variant={location.pathname.includes("/insurance") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/collateral/insurance")}
                  className="rounded-b-none"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Insurance Tracking
                </Button>
              </div>

              {/* Asset Valuations View */}
              {location.pathname.includes("/valuations") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Valuations</CardTitle>
                    <CardDescription>View and manage asset valuations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Estimated Value</TableHead>
                          <TableHead>Current Value</TableHead>
                          <TableHead>Valuation Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collateral.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.type}</TableCell>
                            <TableCell>UGX {item.estimated_value.toLocaleString()}</TableCell>
                            <TableCell>
                              {item.current_value
                                ? `UGX ${item.current_value.toLocaleString()}`
                                : <span className="text-muted-foreground">Not valued</span>
                              }
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">-</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.status === "active" ? "default" : "secondary"}>
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : location.pathname.includes("/insurance") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Insurance Tracking</CardTitle>
                    <CardDescription>Track insurance coverage for collateral assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Insurance Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collateral.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.type}</TableCell>
                            <TableCell>{item.loan_client_name || "-"}</TableCell>
                            <TableCell>UGX {(item.current_value || item.estimated_value).toLocaleString()}</TableCell>
                            <TableCell>
                              {item.has_insurance ? (
                                <Badge variant="default" className="bg-green-600">
                                  Insured
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Insured</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-end mb-4">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Collateral
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Collateral Asset</DialogTitle>
                          <DialogDescription>
                            Register a new collateral asset for a loan application
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Related Loan Application</Label>
                            <Select
                              value={collateralForm.loan_application_id}
                              onValueChange={(val) => setCollateralForm({ ...collateralForm, loan_application_id: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a loan" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeLoans.map(loan => (
                                  <SelectItem key={loan.id} value={loan.id}>
                                    {loan.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Asset Type</Label>
                            <Select
                              value={collateralForm.type}
                              onValueChange={(val) => setCollateralForm({ ...collateralForm, type: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Property">Property</SelectItem>
                                <SelectItem value="Vehicle">Vehicle</SelectItem>
                                <SelectItem value="Business Equipment">Business Equipment</SelectItem>
                                <SelectItem value="Personal Asset">Personal Asset</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Estimated Value (UGX)</Label>
                            <Input
                              type="number"
                              value={collateralForm.estimated_value}
                              onChange={(e) => setCollateralForm({ ...collateralForm, estimated_value: e.target.value })}
                              placeholder="e.g. 5000000"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={collateralForm.description}
                              onChange={(e) => setCollateralForm({ ...collateralForm, description: e.target.value })}
                              placeholder="e.g. 2nd Floor Apartment, Kampala"
                            />
                          </div>
                          <div>
                            <Label>Registration Number / ID</Label>
                            <Input
                              value={collateralForm.registration_number}
                              onChange={(e) => setCollateralForm({ ...collateralForm, registration_number: e.target.value })}
                              placeholder="e.g. UBA 123X"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCollateralSubmit}>Add Collateral</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Collateral</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{collateral.length}</div>
                        <p className="text-xs text-muted-foreground">
                          {collateral.filter(c => c.status === "active").length} active
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          UGX {collateral.reduce((sum, c) => sum + (c.current_value || c.estimated_value), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Total collateral value</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Insured Assets</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {collateral.filter(c => c.has_insurance).length}
                        </div>
                        <p className="text-xs text-muted-foreground">With active insurance</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Collateral Register</CardTitle>
                      <CardDescription>View all collateral and assets</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Estimated Value</TableHead>
                            <TableHead>Current Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Insurance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {collateral.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No collateral registered yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            collateral.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.type}</TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <p className="truncate">{item.description}</p>
                                    {item.registration_number && (
                                      <p className="text-xs text-muted-foreground">
                                        Reg: {item.registration_number}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{item.loan_client_name}</TableCell>
                                <TableCell>UGX {item.estimated_value.toLocaleString()}</TableCell>
                                <TableCell>
                                  {item.current_value
                                    ? `UGX ${item.current_value.toLocaleString()}`
                                    : <span className="text-muted-foreground">-</span>
                                  }
                                </TableCell>
                                <TableCell>
                                  <Badge variant={item.status === "active" ? "default" : "secondary"}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {item.has_insurance ? (
                                    <Badge variant="default" className="bg-green-600">
                                      Insured
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Not Insured</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CollateralAssets;

