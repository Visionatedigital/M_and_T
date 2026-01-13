import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff-login");
      return;
    }
    loadCollateral();
  };

  const loadCollateral = async () => {
    try {
      // Load collateral
      const { data: collateralData, error: collateralError } = await supabase
        .from("collateral")
        .select("*")
        .order("created_at", { ascending: false });

      if (collateralError) throw collateralError;

      // Load insurance data
      const { data: insuranceData, error: insuranceError } = await supabase
        .from("collateral_insurance")
        .select("collateral_id, status")
        .eq("status", "active");

      if (insuranceError) throw insuranceError;

      // Load loan applications to get client names
      const loanIds = (collateralData || [])
        .map(c => c.loan_application_id)
        .filter(Boolean) as string[];

      let loanData: any[] = [];
      if (loanIds.length > 0) {
        const { data: loans, error: loansError } = await supabase
          .from("loan_applications")
          .select("id, full_name")
          .in("id", loanIds);

        if (!loansError && loans) {
          loanData = loans;
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
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Collateral
                    </Button>
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

