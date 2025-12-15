import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Search, Plus, Eye, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  total_loans: number;
  active_loans: number;
  total_borrowed: number;
  total_repaid: number;
}

const Clients = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff-login");
      return;
    }
    loadClients();
  };

  const loadClients = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: loans, error: loansError } = await supabase
        .from("loan_applications")
        .select("*");

      if (loansError) throw loansError;

      const clientsWithStats = (profiles || []).map((profile: any) => {
        const clientLoans = (loans || []).filter((loan: any) => loan.user_id === profile.id);
        const activeLoans = clientLoans.filter((loan: any) => 
          ["approved", "disbursed"].includes(loan.status)
        );
        
        const totalBorrowed = clientLoans.reduce((sum: number, loan: any) => {
          const principal = loan.loan_amount;
          const interest = principal * 0.30;
          return sum + principal + interest;
        }, 0);

        const totalRepaid = activeLoans.reduce((sum: number, loan: any) => {
          const principal = loan.loan_amount;
          const interest = principal * 0.30;
          const totalAmount = principal + interest;
          const monthlyPayment = totalAmount / loan.loan_duration_months;
          const approvedDate = new Date(loan.approved_at || loan.created_at);
          const now = new Date();
          const monthsElapsed = Math.floor((now.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
          return sum + (monthlyPayment * monthsElapsed);
        }, 0);

        return {
          ...profile,
          total_loans: clientLoans.length,
          active_loans: activeLoans.length,
          total_borrowed: totalBorrowed,
          total_repaid: totalRepaid,
        };
      });

      setClients(clientsWithStats);
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

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.phone_number && client.phone_number.includes(searchTerm))
      );
    }

    setFilteredClients(filtered);
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
                  <h1 className="text-3xl font-bold mb-2">Clients</h1>
                  <p className="text-muted-foreground">Manage client information and history</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Create a new client profile
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input placeholder="Enter full name" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" placeholder="Enter email" />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input placeholder="Enter phone number" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button>Add Client</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clients.length}</div>
                    <p className="text-xs text-muted-foreground">Registered clients</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {clients.filter(c => c.active_loans > 0).length}
                    </div>
                    <p className="text-xs text-muted-foreground">With active loans</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      UGX {clients.reduce((sum, c) => sum + c.total_borrowed, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Client List</CardTitle>
                      <CardDescription>View and manage all clients</CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Total Loans</TableHead>
                        <TableHead>Active Loans</TableHead>
                        <TableHead>Total Borrowed</TableHead>
                        <TableHead>Total Repaid</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No clients found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.full_name}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {client.email}
                                </div>
                                {client.phone_number && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3" />
                                    {client.phone_number}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{client.total_loans}</TableCell>
                            <TableCell>{client.active_loans}</TableCell>
                            <TableCell>UGX {client.total_borrowed.toLocaleString()}</TableCell>
                            <TableCell>UGX {client.total_repaid.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
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
    </SidebarProvider>
  );
};

export default Clients;

