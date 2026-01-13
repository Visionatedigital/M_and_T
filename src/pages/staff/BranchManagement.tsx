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
import { Building2, BarChart3, MapPin, Phone, Mail, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string | null;
  email: string | null;
  status: string;
  territory_id: string | null;
  territory_name?: string;
}

interface Territory {
  id: string;
  name: string;
  description: string | null;
}

const BranchManagement = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
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
    loadData();
  };

  const loadData = async () => {
    try {
      // Load branches
      const { data: branchesData, error: branchesError } = await supabase
        .from("branches")
        .select("*")
        .order("created_at", { ascending: false });

      if (branchesError) throw branchesError;

      // Load territories
      const { data: territoriesData, error: territoriesError } = await supabase
        .from("territories")
        .select("*")
        .order("name", { ascending: true });

      if (territoriesError) throw territoriesError;

      // Map territory names to branches
      const branchesWithTerritories = (branchesData || []).map((branch: any) => ({
        ...branch,
        territory_name: territoriesData?.find(t => t.id === branch.territory_id)?.name || "Unassigned",
      }));

      setBranches(branchesWithTerritories);
      setTerritories(territoriesData || []);
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
                <h1 className="text-3xl font-bold mb-2">Branch Management</h1>
                <p className="text-muted-foreground">Manage branches and territories</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={location.pathname.includes("/performance") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/branches/performance")}
                  className="rounded-b-none"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Branch Performance
                </Button>
                <Button
                  variant={location.pathname.includes("/territories") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/branches/territories")}
                  className="rounded-b-none"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Territory Management
                </Button>
                <Button
                  variant={location.pathname.includes("/transfers") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/branches/transfers")}
                  className="rounded-b-none"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Branch Transfers
                </Button>
              </div>

              {/* Branch Performance View */}
              {location.pathname.includes("/performance") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Branch Performance</CardTitle>
                    <CardDescription>View performance metrics for all branches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{branches.length}</div>
                          <p className="text-xs text-muted-foreground">
                            {branches.filter(b => b.status === "active").length} active
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Territories</CardTitle>
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{territories.length}</div>
                          <p className="text-xs text-muted-foreground">Managed territories</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {branches.filter(b => b.status === "active").length}
                          </div>
                          <p className="text-xs text-muted-foreground">Currently operational</p>
                        </CardContent>
                      </Card>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Branch</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Territory</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branches.map((branch) => (
                          <TableRow key={branch.id}>
                            <TableCell className="font-medium">{branch.name}</TableCell>
                            <TableCell>
                              <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                                {branch.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{branch.territory_name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : location.pathname.includes("/transfers") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Branch Transfers</CardTitle>
                    <CardDescription>Manage branch transfers and reassignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-8 text-muted-foreground">
                      Branch transfer functionality coming soon
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{branches.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {branches.filter(b => b.status === "active").length} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Territories</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{territories.length}</div>
                    <p className="text-xs text-muted-foreground">Managed territories</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {branches.filter(b => b.status === "active").length}
                    </div>
                    <p className="text-xs text-muted-foreground">Currently operational</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Branches</CardTitle>
                  <CardDescription>View all branches and their details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Territory</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No branches found
                          </TableCell>
                        </TableRow>
                      ) : (
                        branches.map((branch) => (
                          <TableRow key={branch.id}>
                            <TableCell className="font-medium">{branch.name}</TableCell>
                            <TableCell>{branch.code}</TableCell>
                            <TableCell>{branch.address}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {branch.phone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {branch.phone}
                                  </div>
                                )}
                                {branch.email && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Mail className="h-3 w-3" />
                                    {branch.email}
                                  </div>
                                )}
                                {!branch.phone && !branch.email && (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{branch.territory_name}</TableCell>
                            <TableCell>
                              <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                                {branch.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Territories</CardTitle>
                  <CardDescription>View all managed territories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {territories.length === 0 ? (
                      <p className="text-muted-foreground col-span-full text-center py-8">
                        No territories found
                      </p>
                    ) : (
                      territories.map((territory) => (
                        <Card key={territory.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{territory.name}</CardTitle>
                            {territory.description && (
                              <CardDescription>{territory.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-muted-foreground">
                              {branches.filter(b => b.territory_id === territory.id).length} branch(es)
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
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

export default BranchManagement;

