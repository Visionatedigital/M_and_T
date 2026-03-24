import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EditProductDialog } from "@/components/staff/EditProductDialog";
import { useToast } from "@/hooks/use-toast";

/** Purpose-based loan products (what the loan is for). Min/max/interest follow lending-category rules in DB. */
const PURPOSE_PRODUCTS = [
  { id: "bus", name: "Business", code: "BUS", description: "Small business expansion and trade", status: "active" },
  { id: "agr", name: "Agricultural", code: "AGR", description: "Farming and livestock investment", status: "active" },
  { id: "sch", name: "School Fees", code: "SCH", description: "Education support loans", status: "active" },
  { id: "emg", name: "Emergency", code: "EMG", description: "Medical or urgent needs", status: "active" },
  { id: "oth", name: "Other", code: "OTH", description: "Miscellaneous purposes", status: "active" },
];

const ProductManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [productDialog, setProductDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    product: any | null;
  }>({ open: false, mode: "edit", product: null });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return products;
    return (products || []).filter(
      (p: any) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q) ||
        String(p.base_interest_rate ?? "").includes(q)
    );
  }, [products, searchTerm]);

  /** Limits shown on purpose rows come from lending categories; prefer Individual for editing. */
  const primaryCategoryForPurposeLimits = () => {
    if (!products.length) return null;
    const individual = products.find((p) => /individual/i.test(String(p.name || "")));
    return individual ?? products[0];
  };

  const openPurposeLimitsEditor = () => {
    const cat = primaryCategoryForPurposeLimits();
    if (!cat) {
      toast({
        title: "No lending categories",
        description: "Add at least one category in “Loan categories” below, then you can set amounts and rates.",
        variant: "destructive",
      });
      return;
    }
    setProductDialog({ open: true, mode: "edit", product: cat });
  };

  const filteredPurposeProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return PURPOSE_PRODUCTS;
    return PURPOSE_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await api.auth.getMe();
      loadProducts();
    } catch (err) {
      navigate("/staff-login");
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.products.getAll();
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
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Loan Products</h1>
                  <p className="text-muted-foreground">
                Purpose-based products and group vs individual lending categories
              </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products or categories..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button type="button" onClick={() => setProductDialog({ open: true, mode: "create", product: null })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Purpose-based products (Business, Agricultural, …) */}
              <Card>
                <CardHeader>
                  <CardTitle>Active products</CardTitle>
                  <CardDescription>
                    What the loan is used for. Amount and rate limits are set per lending category (Individual vs Group)
                    below.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Min amount</TableHead>
                        <TableHead>Max amount</TableHead>
                        <TableHead>Interest rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurposeProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No purpose products match your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                      filteredPurposeProducts.map((p) => {
                        const limits = primaryCategoryForPurposeLimits() ?? products[0];
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell>{p.code}</TableCell>
                            <TableCell>
                              UGX {limits?.min_amount?.toLocaleString() ?? "150,000"}
                            </TableCell>
                            <TableCell>
                              UGX {limits?.max_amount?.toLocaleString() ?? "2,000,000"}
                            </TableCell>
                            <TableCell>{limits != null ? `${limits.base_interest_rate ?? 0}%` : "—"}</TableCell>
                            <TableCell>
                              <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={openPurposeLimitsEditor}
                                title="Edit min/max amounts and rates (Individual category, or first category)"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Group Loan Rate Card - Simplified */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Group lending rate</CardTitle>
                    <CardDescription>Applied when loan category is Group (group-based lending)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-primary">30%</div>
                        <p className="text-sm text-muted-foreground">Flat rate for the Group lending category</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reinvestment Policy</CardTitle>
                    <CardDescription>Settings for loan reinvestment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-green-600">Enabled</div>
                        <p className="text-sm text-muted-foreground">Continuous reinvestment active</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lending categories: Individual vs Group (stored as loan_products in DB) */}
              <Card>
                <CardHeader>
                  <CardTitle>Loan categories</CardTitle>
                  <CardDescription>
                    Each row is a separate loan product in the database with its own fees and rates. Use{" "}
                    <strong>Add Product</strong> to create another product, or <strong>Edit</strong> to change that
                    product&apos;s fees (fixed UGX and %).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Min amount</TableHead>
                        <TableHead>Max amount</TableHead>
                        <TableHead>Interest rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No lending categories found.
                          </TableCell>
                        </TableRow>
                      ) : filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No categories match your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              <div>{product.name}</div>
                              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                                {product.name === "Group Loan"
                                  ? "Joint group liability, multiple members"
                                  : "Single borrower, individual liability"}
                              </p>
                            </TableCell>
                            <TableCell>{product.code}</TableCell>
                            <TableCell>UGX {product.min_amount?.toLocaleString() || 0}</TableCell>
                            <TableCell>UGX {product.max_amount?.toLocaleString() || 0}</TableCell>
                            <TableCell>{product.base_interest_rate ?? 30}%</TableCell>
                            <TableCell>
                              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setProductDialog({ open: true, mode: "edit", product })}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>
          </main>
        </div>
      </div>

      <EditProductDialog
        open={productDialog.open}
        onOpenChange={(open) => {
          if (!open) setProductDialog({ open: false, mode: "edit", product: null });
        }}
        mode={productDialog.mode}
        product={productDialog.product}
        onSuccess={loadProducts}
      />
    </SidebarProvider>
  );
};

export default ProductManagement;
