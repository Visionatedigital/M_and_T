import { useEffect, useState } from "react";
import { AddStaffDialog } from "@/components/staff/AddStaffDialog";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StaffMember {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

export function StaffManagement() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredStaff = staff.filter((m) => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return true;
        return (
            (m.full_name?.toLowerCase() || "").includes(q) ||
            (m.email?.toLowerCase() || "").includes(q) ||
            (m.role?.toLowerCase() || "").includes(q)
        );
    });

    const fetchStaff = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.users.getAll();
            setStaff(data);
        } catch (err: any) {
            setError(err.message || "Failed to load staff list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-8 bg-muted/30">
                        <div className="space-y-6 max-w-7xl mx-auto">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
                                    <p className="text-muted-foreground">
                                        Manage loan officers and system administrators.
                                    </p>
                                </div>
                                <AddStaffDialog onSuccess={fetchStaff} />
                            </div>

                            <Card>
                                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
                                    <CardTitle>Staff Directory</CardTitle>
                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search name, email, role..."
                                            className="pl-9"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : error ? (
                                        <div className="text-red-500 p-4 bg-red-50 rounded-md">
                                            {error}
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Date Added</TableHead>
                                                    <TableHead className="text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredStaff.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                            No staff match your search.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                filteredStaff.map((member) => (
                                                    <TableRow key={member.id}>
                                                        <TableCell className="font-medium">{member.full_name}</TableCell>
                                                        <TableCell>{member.email}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                                                {member.role === 'admin' ? 'Administrator' : 'Loan Officer'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                                Active
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
