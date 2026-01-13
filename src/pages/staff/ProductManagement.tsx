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
import { Package, Plus, DollarSign, BarChart3 } from "lucide-react";

const ProductManagement = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff-login");
      return;
    }
    loadProducts();
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("loan_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error loading products:", error);
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
                <h1 className="text-3xl font-bold mb-2">Product Management</h1>
                <p className="text-muted-foreground">Manage loan products and interest rates</p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b pb-2">
                <Button
                  variant={!location.pathname.includes("/rates") && !location.pathname.includes("/performance") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/products")}
                  className="rounded-b-none"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Loan Products
                </Button>
                <Button
                  variant={location.pathname.includes("/rates") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/products/rates")}
                  className="rounded-b-none"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Interest Rate Settings
                </Button>
                <Button
                  variant={location.pathname.includes("/performance") ? "default" : "ghost"}
                  onClick={() => navigate("/staff-dashboard/products/performance")}
                  className="rounded-b-none"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Product Performance
                </Button>
              </div>

              {/* Interest Rate Settings View */}
              {location.pathname.includes("/rates") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Interest Rate Settings</CardTitle>
                    <CardDescription>Configure interest rates for loan products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Group Loan Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">30%</div>
                          <p className="text-sm text-muted-foreground mt-2">Flat interest rate applied to all group loans</p>
                        </CardContent>
                      </Card>
                      <p className="text-center py-8 text-muted-foreground">
                        Additional rate configuration options coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : location.pathname.includes("/performance") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Performance</CardTitle>
                    <CardDescription>View performance metrics for loan products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{products.length}</div>
                          <p className="text-xs text-muted-foreground">Loan products</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {products.filter(p => p.status === "active").length}
                          </div>
                          <p className="text-xs text-muted-foreground">Currently available</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Group Loan Rate</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">30%</div>
                          <p className="text-xs text-muted-foreground">Flat interest rate</p>
                        </CardContent>
                      </Card>
                    </div>
                    <p className="text-center py-8 text-muted-foreground">
                      Performance analytics coming soon
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-end mb-4">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                        <p className="text-xs text-muted-foreground">Loan products</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {products.filter(p => p.status === "active").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently available</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Group Loan Rate</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">30%</div>
                        <p className="text-xs text-muted-foreground">Flat interest rate</p>
                      </CardContent>
                    </Card>
                  </div>

              <Card>
                <CardHeader>
                  <CardTitle>Loan Products</CardTitle>
                  <CardDescription>Manage all loan products and their settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Min Amount</TableHead>
                        <TableHead>Max Amount</TableHead>
                        <TableHead>Interest Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No products found. Group loans use a standard 30% flat rate.
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.code}</TableCell>
                            <TableCell>UGX {product.min_amount?.toLocaleString() || 0}</TableCell>
                            <TableCell>UGX {product.max_amount?.toLocaleString() || 0}</TableCell>
                            <TableCell>{product.base_interest_rate || 30}%</TableCell>
                            <TableCell>
                              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Edit</Button>
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
                  <CardTitle>Group Loan Settings</CardTitle>
                  <CardDescription>Configure group loan parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Interest Rate</div>
                        <div className="text-sm text-muted-foreground">Flat rate applied to all group loans</div>
                      </div>
                      <div className="text-2xl font-bold">30%</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Reinvestment Policy</div>
                        <div className="text-sm text-muted-foreground">Continuous reinvestment enabled</div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
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

export default ProductManagement;

