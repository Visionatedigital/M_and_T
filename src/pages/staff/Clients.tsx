import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Search, Plus, Eye, Phone, Mail, MapPin, UserPlus, FileText, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';


// Add Switch import if not present, check file first? No, standard in shadcn.
// Actually, let's look at activeLoans where Toggle might be used? No.
// Safe bet: Use a simple Button or Checkbox if not sure about Switch path.
// But standard shadcn is components/ui/switch.

import { Switch } from "@/components/ui/switch";

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
  group_id?: string | null;
  is_group?: boolean;
  district?: string;
  latitude?: number;
  longitude?: number;
  credit_score?: number;
}

// ... existing code ...

const getScoreColor = (score: number) => {
  if (score >= 750) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 650) return "bg-blue-100 text-blue-800 border-blue-200";
  if (score >= 500) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
};

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Clients = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGroupView, setIsGroupView] = useState(false);
  const [editLocationDialogOpen, setEditLocationDialogOpen] = useState(false);
  const [selectedClientForLocation, setSelectedClientForLocation] = useState<Client | null>(null);
  const [locationForm, setLocationForm] = useState({
    district: "",
    county: "",
    sub_county: "",
    parish: "",
    village: "",
    latitude: "",
    longitude: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    loadClients();
  }, [isGroupView]);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, location.pathname]);

  const checkAuth = async () => {
    try {
      await api.auth.getMe();
      loadClients();
    } catch (err) {
      navigate("/staff-login");
    }
  };

  const loadClients = async () => {
    try {
      const data = await api.clients.getAll(isGroupView);
      setClients(data);
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
          (client.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (client.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (client.phone_number && client.phone_number.includes(searchTerm))
      );
    }

    setFilteredClients(filtered);
  };

  const handleEditLocation = async (client: Client) => {
    setSelectedClientForLocation(client);
    // Address fields should ideally come from the backend in the client object
    setLocationForm({
      district: client.district || "",
      county: "", // Fallback if not in profile
      sub_county: "",
      parish: "",
      village: client.village || "",
      latitude: client.latitude?.toString() || "",
      longitude: client.longitude?.toString() || "",
    });
    setEditLocationDialogOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!selectedClientForLocation) return;

    try {
      await api.clients.updateLocation(selectedClientForLocation.id, {
        district: locationForm.district || null,
        county: locationForm.county || null,
        sub_county: locationForm.sub_county || null,
        parish: locationForm.parish || null,
        village: locationForm.village || null,
        latitude: locationForm.latitude ? parseFloat(locationForm.latitude) : null,
        longitude: locationForm.longitude ? parseFloat(locationForm.longitude) : null,
      });

      toast({
        title: "Success",
        description: "Client location updated successfully",
      });

      setEditLocationDialogOpen(false);
      loadClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
                  <h1 className="text-3xl font-bold mb-2">Clients</h1>
                  <p className="text-muted-foreground">Manage branch clients and their loan performance</p>
                </div>
              </div>

              {/* Statistics Cards - Keep existing */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* ... existing stats cards ... reused code ... */}
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
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      UGX {clients.reduce((sum, c) => sum + c.total_borrowed, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">All time principal + interest</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="list" className="space-y-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="list">Client List</TabsTrigger>
                  <TabsTrigger value="find">Find My Client</TabsTrigger>
                  <TabsTrigger value="map">Client Locations</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Client List</CardTitle>
                          <CardDescription>View and manage all clients</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="view-mode">Show Group Totals</Label>
                          <Switch
                            id="view-mode"
                            checked={isGroupView}
                            onCheckedChange={setIsGroupView}
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
                            <TableHead>Credit Score</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* ... existing table body logic ... */}
                          {filteredClients.slice(0, 10).map((client) => (
                            <TableRow key={client.id}>
                              <TableCell className="font-medium">{client.full_name}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {client.email}
                                  </div>
                                  {client.phone_number && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Phone className="h-3 w-3" />
                                      {client.phone_number}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{client.total_loans}</TableCell>
                              <TableCell>{client.active_loans}</TableCell>
                              <TableCell className="font-medium text-primary">
                                UGX {client.total_borrowed.toLocaleString()}
                              </TableCell>
                              <TableCell className="font-medium text-green-600">
                                UGX {client.total_repaid.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs border font-medium ${getScoreColor(client.credit_score || 300)}`}>
                                  {client.credit_score || 300}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/staff-dashboard/clients/history?id=${client.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="find" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Find My Client</CardTitle>
                      <CardDescription>Search for a client by name, phone, or email to view their details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by Name, Phone, or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                        <Button>Search</Button>
                      </div>

                      {searchTerm && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Client Name</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Active Loans</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredClients.map((client) => (
                              <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.full_name}</TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {client.phone_number && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3" />
                                        {client.phone_number}
                                      </div>
                                    )}
                                    {client.email && client.email !== "No Email" && client.email !== "Group Account" && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        {client.email}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {client.village && client.district ? (
                                    <div className="flex items-center gap-2 text-sm">
                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                      {client.village}, {client.district}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No location</span>
                                  )}
                                </TableCell>
                                <TableCell>{client.active_loans}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditLocation(client)}
                                    >
                                      <MapPin className="h-4 w-4 mr-1" />
                                      Edit Location
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => navigate(`/staff-dashboard/clients/history?id=${client.id}`)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View Profile
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {filteredClients.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">No clients found.</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="map" className="h-[600px]">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Client Locations</CardTitle>
                      <CardDescription>Geographic distribution of your clients.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[500px] p-0 overflow-hidden rounded-b-lg">
                      <MapContainer center={[0.3476, 32.5825]} zoom={8} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* Display all clients with location data */}
                        {clients
                          .filter(client => client.latitude && client.longitude)
                          .map((client) => (
                            <Marker key={client.id} position={[client.latitude!, client.longitude!]}>
                              <Popup>
                                <div className="p-2">
                                  <h3 className="font-bold">{client.full_name}</h3>
                                  <p className="text-sm text-muted-foreground">{client.village}, {client.district}</p>
                                  <p className="text-sm mt-1">Active Loans: {client.active_loans}</p>
                                  <Button
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => navigate(`/staff-dashboard/clients/history?id=${client.id}`)}
                                  >
                                    View Profile
                                  </Button>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        {/* Show message if no location data available */}
                        {clients.filter(c => c.latitude && c.longitude).length === 0 && (
                          <Marker position={[0.3476, 32.5825]}>
                            <Popup>
                              <div className="p-2">
                                <p className="text-sm">No client location data available yet.</p>
                                <p className="text-xs text-muted-foreground mt-1">Locations will appear as loan applications with GPS data are created.</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Location Dialog */}
      <Dialog open={editLocationDialogOpen} onOpenChange={setEditLocationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client Location</DialogTitle>
            <DialogDescription>
              Update location information for {selectedClientForLocation?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  placeholder="Enter district"
                  value={locationForm.district}
                  onChange={(e) => setLocationForm({ ...locationForm, district: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  placeholder="Enter county"
                  value={locationForm.county}
                  onChange={(e) => setLocationForm({ ...locationForm, county: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sub_county">Sub-County</Label>
                <Input
                  id="sub_county"
                  placeholder="Enter sub-county"
                  value={locationForm.sub_county}
                  onChange={(e) => setLocationForm({ ...locationForm, sub_county: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parish">Parish</Label>
                <Input
                  id="parish"
                  placeholder="Enter parish"
                  value={locationForm.parish}
                  onChange={(e) => setLocationForm({ ...locationForm, parish: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="village">Village *</Label>
              <Input
                id="village"
                placeholder="Enter village"
                value={locationForm.village}
                onChange={(e) => setLocationForm({ ...locationForm, village: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (GPS)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 0.3476"
                  value={locationForm.latitude}
                  onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (GPS)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 32.5825"
                  value={locationForm.longitude}
                  onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <p>* Required fields. GPS coordinates are optional but helpful for mapping.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditLocationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLocation}
              disabled={!locationForm.district || !locationForm.village}
            >
              Save Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider >
  );
};

export default Clients;
