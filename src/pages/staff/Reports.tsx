import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, DollarSign, Users, TrendingUp } from "lucide-react";

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(false);
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
                <h1 className="text-3xl font-bold mb-2">Reports</h1>
                <p className="text-muted-foreground">View comprehensive reports and analytics</p>
              </div>

              <Tabs defaultValue="loans" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="loans">Loan Reports</TabsTrigger>
                  <TabsTrigger value="financial">Financial Reports</TabsTrigger>
                  <TabsTrigger value="clients">Client Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="loans" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Loan Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Applications:</span>
                            <span className="font-bold">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Approved Loans:</span>
                            <span className="font-bold">0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rejection Rate:</span>
                            <span className="font-bold">0%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Loan Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Chart will be displayed here</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Product Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Product breakdown will be shown here</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Interest Earned:</span>
                            <span className="font-bold">UGX 0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Processing Fees:</span>
                            <span className="font-bold">UGX 0</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cash Flow</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Cash flow chart will be displayed here</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="clients" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Clients:</span>
                          <span className="font-bold">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Clients:</span>
                          <span className="font-bold">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>New Clients (This Month):</span>
                          <span className="font-bold">0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Reports;

