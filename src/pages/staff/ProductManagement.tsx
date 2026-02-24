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
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, DollarSign, BarChart3 } from "lucide-react";

const ProductManagement = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    code: "",
    description: "",
    min_amount: "",
    max_amount: "",
    base_interest_rate: "20",
  });

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
            loadProducts();
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
        loadProducts();
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
            loadProducts();
            return;
          }
        } catch (e) { }
      }
      navigate("/staff-login");
    }
  };

  const loadProducts = async () => {
    try {
      let data = [];
      if (isSupabaseOffline) {
        console.log("🛠️ Loading products from local API...");
        data = await api.products.getAll();
      } else {
        const { data: supabaseData, error } = await supabase
          .from("loan_products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        data = supabaseData || [];
      }
      setProducts(data);
    } catch (error: any) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSubmit = async () => {
    try {
      if (!productForm.name || !productForm.code) {
        toast({ title: "Error", description: "Name and code are required", variant: "destructive" });
        return;
      }

      const data = {
        ...productForm,
        min_amount: parseFloat(productForm.min_amount) || 0,
        max_amount: parseFloat(productForm.max_amount) || 0,
        base_interest_rate: parseFloat(productForm.base_interest_rate) || 20,
      };

      if (isSupabaseOffline) {
        await api.products.create(data);
      } else {
        const { error } = await supabase.from("loan_products").insert(data);
        if (error) throw error;
      }

      toast({ title: "Success", description: "Product created successfully" });
      setIsDialogOpen(false);
      loadProducts();
      setProductForm({ name: "", code: "", description: "", min_amount: "", max_amount: "", base_interest_rate: "20" });
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
                          <CardTitle className="text-lg">Standard Interest Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">20%</div>
                          <p className="text-sm text-muted-foreground mt-2">Default flat interest rate for individual loans</p>
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
                          <CardTitle className="text-sm font-medium">Default Interest Rate</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">20%</div>
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
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Loan Product</DialogTitle>
                          <DialogDescription>Create a new loan product configuration</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Product Name</Label>
                            <Input
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              placeholder="e.g. Small Business Loan"
                            />
                          </div>
                          <div>
                            <Label>Product Code</Label>
                            <Input
                              value={productForm.code}
                              onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                              placeholder="e.g. SBL-01"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Min Amount (UGX)</Label>
                              <Input
                                type="number"
                                value={productForm.min_amount}
                                onChange={(e) => setProductForm({ ...productForm, min_amount: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Max Amount (UGX)</Label>
                              <Input
                                type="number"
                                value={productForm.max_amount}
                                onChange={(e) => setProductForm({ ...productForm, max_amount: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Base Interest Rate (%)</Label>
                            <Input
                              type="number"
                              value={productForm.base_interest_rate}
                              onChange={(e) => setProductForm({ ...productForm, base_interest_rate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={productForm.description}
                              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleProductSubmit}>Add Product</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                        <CardTitle className="text-sm font-medium">Default Interest Rate</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">20%</div>
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
                                No products found. Individual loans use configurable interest rates per product.
                              </TableCell>
                            </TableRow>
                          ) : (
                            products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.code}</TableCell>
                                <TableCell>UGX {product.min_amount?.toLocaleString() || 0}</TableCell>
                                <TableCell>UGX {product.max_amount?.toLocaleString() || 0}</TableCell>
                                <TableCell>{product.base_interest_rate || 20}%</TableCell>
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
                      <CardTitle>Loan Settings</CardTitle>
                      <CardDescription>Configure individual loan parameters</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">Default Interest Rate</div>
                            <div className="text-sm text-muted-foreground">Flat rate applied to individual loans</div>
                          </div>
                          <div className="text-2xl font-bold">20%</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">Flexible Terms</div>
                            <div className="text-sm text-muted-foreground">Customizable loan durations and amounts</div>
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

