import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, BarChart3, MapPin, Phone, Mail, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { staffTabButtonClass, staffTabRowClass } from "@/lib/staffNavClasses";

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBranches = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        (b.name || "").toLowerCase().includes(q) ||
        (b.code || "").toLowerCase().includes(q) ||
        (b.territory_name || "").toLowerCase().includes(q) ||
        (b.address || "").toLowerCase().includes(q) ||
        (b.phone || "").includes(searchTerm.trim()) ||
        (b.email || "").toLowerCase().includes(q)
    );
  }, [branches, searchTerm]);

  const filteredTerritories = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return territories;
    return territories.filter(
      (t) =>
        (t.name || "").toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
    );
  }, [territories, searchTerm]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await api.auth.getMe();
      loadData();
    } catch (err) {
      navigate("/staff-login");
    }
  };

  const loadData = async () => {
    try {
      const [branchesData, territoriesData] = await Promise.all([
        api.branches.getAll(),
        api.territories.getAll()
      ]);

      // Map territory names to branches
      const branchesWithTerritories = (branchesData || []).map((branch: any) => ({
        ...branch,
        territory_name: territoriesData?.find((t: any) => t.id === branch.territory_id)?.name || "Unassigned",
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
              <div className={staffTabRowClass}>
                <Button
                  variant={location.pathname.includes("/performance") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/branches/performance")}
                  className={staffTabButtonClass}
                >
                  <BarChart3 className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
                  Branch Performance
                </Button>
                <Button
                  variant={location.pathname.includes("/territories") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/branches/territories")}
                  className={staffTabButtonClass}
                >
                  <Building2 className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
                  Territory Management
                </Button>
                <Button
                  variant={location.pathname.includes("/transfers") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/branches/transfers")}
                  className={staffTabButtonClass}
                >
                  <FileText className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" />
                  Branch Transfers
                </Button>
              </div>

              {!location.pathname.includes("/transfers") && (
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search branches or territories..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

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
                        {filteredBranches.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                              {branches.length === 0 ? "No branches yet." : "No branches match your search."}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredBranches.map((branch) => (
                            <TableRow key={branch.id}>
                              <TableCell className="font-medium">{branch.name}</TableCell>
                              <TableCell>
                                <Badge variant={branch.status === "active" ? "default" : "secondary"}>
                                  {branch.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{branch.territory_name}</TableCell>
                            </TableRow>
                          ))
                        )}
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
                          {filteredBranches.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                {branches.length === 0 ? "No branches found" : "No branches match your search."}
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredBranches.map((branch) => (
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
                        {filteredTerritories.length === 0 ? (
                          <p className="text-muted-foreground col-span-full text-center py-8">
                            {territories.length === 0 ? "No territories found" : "No territories match your search."}
                          </p>
                        ) : (
                          filteredTerritories.map((territory) => (
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

