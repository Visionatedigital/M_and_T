
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone, Mail, MapPin, TrendingUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientDetails {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    photo_url?: string;
    credit_score: number;
    district?: string;
    village?: string;
    total_loans: number;
    active_loans: number;
    total_borrowed: number;
    total_repaid: number;
    created_at: string;
}

const ClientDetails = () => {
    const [searchParams] = useSearchParams();
    const clientId = searchParams.get("id");
    const navigate = useNavigate();
    const { toast } = useToast();
    const [client, setClient] = useState<ClientDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadClientDetails = async (id: string) => {
        try {
            const data = await api.clients.get(id);
            setClient({
                ...data,
                credit_score: data.credit_score || 300
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to load client details",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) {
            loadClientDetails(clientId);
        } else {
            toast({
                title: "Error",
                description: "No client selected",
                variant: "destructive",
            });
            navigate("/staff-dashboard/clients");
        }
    }, [clientId, navigate, toast]);

    const getScoreColor = (score: number) => {
        if (score >= 750) return "text-green-600";
        if (score >= 650) return "text-blue-600";
        if (score >= 500) return "text-orange-600";
        return "text-red-600";
    };

    const getScoreBadge = (score: number) => {
        if (score >= 750) return "Excellent";
        if (score >= 650) return "Good";
        if (score >= 500) return "Fair";
        return "Poor";
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (!client) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-lg text-muted-foreground">Client not found</p>
                <Button variant="link" onClick={() => navigate("/staff-dashboard/clients")}>Go Back</Button>
            </div>
        </div>
    );

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-5xl mx-auto space-y-6">

                            <Button variant="ghost" className="mb-4" onClick={() => navigate("/staff-dashboard/clients")}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
                            </Button>

                            <div className="grid gap-6 md:grid-cols-3">
                                {/* Profile Card */}
                                <Card className="md:col-span-2">
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">{client.full_name}</CardTitle>
                                            <CardDescription>Client since {new Date(client.created_at).toLocaleDateString()}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Phone className="mr-2 h-4 w-4" /> Phone
                                                </div>
                                                <p>{client.phone_number || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Mail className="mr-2 h-4 w-4" /> Email
                                                </div>
                                                <p>{client.email || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="mr-2 h-4 w-4" /> Address
                                                </div>
                                                <p>{client.village}, {client.district || client.address}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Credit Score Card */}
                                <Card className="bg-gradient-to-br from-white to-slate-50 border-primary/20 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            Credit Score
                                        </CardTitle>
                                        <CardDescription>Based on repayment history</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center justify-center py-6">
                                        <div className={`relative flex items-center justify-center h-32 w-32 rounded-full border-8 ${client.credit_score >= 750 ? "border-green-500" :
                                            client.credit_score >= 650 ? "border-blue-500" :
                                                client.credit_score >= 500 ? "border-orange-500" : "border-red-500"
                                            }`}>
                                            <div className="text-center">
                                                <span className={`text-3xl font-bold ${getScoreColor(client.credit_score)}`}>{client.credit_score}</span>
                                                <p className="text-xs uppercase font-semibold text-muted-foreground mt-1">{getScoreBadge(client.credit_score)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 w-full space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Base Score</span>
                                                <span className="font-medium">300</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Longevity</span>
                                                <span className="text-green-600 font-medium">+ Longevity and History</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Performance</span>
                                                <span className={client.credit_score > 500 ? "text-green-600 font-medium" : "text-red-500"}>
                                                    {client.credit_score > 500 ? "Good" : "Needs Imp."}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Top Up Eligibility Banner */}
                            {(client.credit_score >= 600 || client.active_loans === 0) && (
                                <Card className="bg-green-50 border-green-200">
                                    <CardContent className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-green-900">Eligible for Top-Up</h3>
                                                <p className="text-green-700">Client has a good credit score and payment history.</p>
                                            </div>
                                        </div>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => {
                                                toast({
                                                    title: "Notification Sent",
                                                    description: `Top-up offer sent to ${client.phone_number}`,
                                                });
                                            }}
                                        >
                                            Notify Client
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Financial Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Loans</p>
                                            <p className="text-2xl font-bold">{client.total_loans || 0}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Active Loans</p>
                                            <p className="text-2xl font-bold">{client.active_loans || 0}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Borrowed</p>
                                            <p className="text-lg font-bold">UGX {(client.total_borrowed || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Repaid</p>
                                            <p className="text-lg font-bold text-green-600">UGX {(client.total_repaid || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default ClientDetails;
// Force Rebuild
