import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Save, ArrowLeft } from "lucide-react";

const AddBorrower = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const generateUniqueId = () => {
        return `MNT-${Math.floor(100000 + Math.random() * 900000)}`;
    };

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_middle_name: "",
        business_name: "",
        unique_number: generateUniqueId(),
        gender: "",
        title: "",
        phone_number: "",
        email: "",
        dob: "",
        address: "",
        city: "",
        province_state: "",
        zipcode: "",
        landline_phone: "",
        working_status: "",
        credit_score: "500",
        description: "",
        assigned_officer_id: "",
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        borrower_photo: null,
        borrower_files: null,
    });

    const [staffList, setStaffList] = useState<any[]>([]);

    useEffect(() => {
        // Fetch staff for loan officer assignment
        const loadStaff = async () => {
            try {
                const staff = await api.users.getAll();
                setStaffList(staff);
            } catch (err) {
                console.error("Failed to fetch staff:", err);
            }
        };
        loadStaff();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles.length > 0) {
            setFiles(prev => ({ ...prev, [id]: selectedFiles[0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name && !formData.business_name) {
            toast({
                title: "Error",
                description: "You must enter at least First Name or Business Name",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // In a real app, we would upload files to storage (Supabase S3, etc.)
            // For now, we'll just pass the metadata if available
            const personalName = `${formData.first_name || ''} ${formData.last_middle_name || ''}`.trim();
            const submissionData = {
                ...formData,
                full_name: personalName || formData.business_name,
                unique_number: formData.unique_number || generateUniqueId(),
                borrower_photo: files.borrower_photo ? files.borrower_photo.name : null,
                borrower_files: files.borrower_files ? files.borrower_files.name : null,
            };

            const result = await api.borrowers.create(submissionData);

            toast({
                title: "Success",
                description: "Borrower added successfully",
            });

            navigate(`/staff-dashboard/borrowers/history?id=${result.id}`);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add borrower",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-muted/20">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => navigate("/staff-dashboard/borrowers")}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to List
                                </Button>
                                <h1 className="text-3xl font-bold">Add New Borrower</h1>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserPlus className="h-5 w-5 text-primary" />
                                        Borrower Registration Form
                                    </CardTitle>
                                    <CardDescription>All fields are optional, but at least First Name or Business Name is required.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-8">


                                        {/* Section: Personal / Business Names */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name">First Name</Label>
                                                <Input id="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter First Name Only" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_middle_name">Middle / Last Name</Label>
                                                <Input id="last_middle_name" value={formData.last_middle_name} onChange={handleChange} placeholder="Middle and Last Name" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="business_name">Business Name</Label>
                                                <Input id="business_name" value={formData.business_name} onChange={handleChange} placeholder="Business Name" />
                                            </div>
                                        </div>

                                        {/* Section: Unique Info & Gender */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="unique_number">Unique Number</Label>
                                                <Input id="unique_number" value={formData.unique_number} onChange={handleChange} placeholder="D001YV0" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="gender">Gender</Label>
                                                <select
                                                    id="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title</Label>
                                                <select
                                                    id="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select Title</option>
                                                    <option value="Mr.">Mr.</option>
                                                    <option value="Mrs.">Mrs.</option>
                                                    <option value="Ms.">Ms.</option>
                                                    <option value="Dr.">Dr.</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Section: Contact Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone_number">Mobile (Numbers Only)</Label>
                                                <Input id="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+256..." />
                                                <p className="text-[10px] text-muted-foreground">No country code, spaces, or characters for SMS compatibility.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                                            </div>
                                        </div>

                                        {/* Section: DOB & Address */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="dob">Date of Birth</Label>
                                                <Input id="dob" type="date" value={formData.dob} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Address</Label>
                                                <Input id="address" value={formData.address} onChange={handleChange} placeholder="Address" />
                                            </div>
                                        </div>

                                        {/* Section: Location Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input id="city" value={formData.city} onChange={handleChange} placeholder="City" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="province_state">Province / State</Label>
                                                <Input id="province_state" value={formData.province_state} onChange={handleChange} placeholder="Province or State" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zipcode">Zipcode</Label>
                                                <Input id="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zipcode" />
                                            </div>
                                        </div>

                                        {/* Section: Financial / Work */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="landline_phone">Landline Phone</Label>
                                                <Input id="landline_phone" value={formData.landline_phone} onChange={handleChange} placeholder="Landline Phone" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="working_status">Working Status</Label>
                                                <select
                                                    id="working_status"
                                                    value={formData.working_status}
                                                    onChange={handleChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Select Status</option>
                                                    <option value="Employed">Employed</option>
                                                    <option value="Self-Employed">Self-Employed</option>
                                                    <option value="Unemployed">Unemployed</option>
                                                    <option value="Student">Student</option>
                                                    <option value="Retired">Retired</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                             <div className="space-y-2">
                                                 <Label htmlFor="credit_score" className="flex items-center justify-between">
                                                     Credit Score
                                                     <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">SYSTEM</span>
                                                 </Label>
                                                 <Input id="credit_score" type="number" value={formData.credit_score} disabled className="bg-muted/50" placeholder="System Generated" />
                                             </div>
                                        </div>

                                        {/* Section: Files & Description */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="borrower_photo">Borrower Photo</Label>
                                                <Input id="borrower_photo" type="file" onChange={handleFileChange} className="cursor-pointer" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="borrower_files">Borrower Files</Label>
                                                <Input id="borrower_files" type="file" onChange={handleFileChange} className="cursor-pointer" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (Optional)</Label>
                                            <textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Enter borrower description..."
                                            ></textarea>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="assigned_officer_id">Assign Loan Officer</Label>
                                            <select
                                                id="assigned_officer_id"
                                                value={formData.assigned_officer_id}
                                                onChange={handleChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Select a Loan Officer (Optional)</option>
                                                {staffList.map((staff: any) => (
                                                    <option key={staff.id} value={staff.id}>
                                                        {staff.full_name} ({staff.role === 'admin' ? 'Administrator' : 'Loan Officer'})
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-muted-foreground">Assign a loan officer. They will see this borrower in their dashboard.</p>
                                        </div>

                                        <div className="flex justify-end gap-4 border-t pt-6">
                                            <Button type="button" variant="outline" onClick={() => navigate("/staff-dashboard/borrowers")} disabled={isLoading}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isLoading} className="px-8 shadow-lg">
                                                {isLoading ? "Saving..." : "Save Borrower"}
                                                {!isLoading && <Save className="ml-2 h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AddBorrower;
