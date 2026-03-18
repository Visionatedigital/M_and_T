import React from "react";
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function Settings() {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <StaffSidebar />
                <div className="flex-1 flex flex-col">
                    <StaffHeader />
                    <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-slate-50 to-indigo-50/20">
                        <div className="max-w-6xl mx-auto space-y-8">

                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        <div className="bg-indigo-600 text-white p-2 rounded-xl">
                                            <Settings2 className="h-6 w-6" />
                                        </div>
                                        Settings
                                    </h1>
                                    <p className="text-slate-500 mt-2 font-medium">Manage your system preferences and configurations.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-white border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-indigo-600" /> Role Permissions
                                        </CardTitle>
                                        <CardDescription>Configure what different staff levels can access.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="font-bold text-slate-800">Loan Officer</div>
                                            <Badge variant="outline">View Only Access</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="font-bold text-slate-800">Administrator</div>
                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Full Access</Badge>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium italic">Role-based access control is currently managed at the system level. Granular permissions will be available in the next version.</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-white border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Settings2 className="h-5 w-5 text-indigo-600" /> Technical Settings
                                        </CardTitle>
                                        <CardDescription>System-wide staff configurations.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest text-slate-400 font-black">Login Security</Label>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-700">Two-Factor Authentication</span>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500">Disabled</Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest text-slate-400 font-black">Audit Logging</Label>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-700">Activity History Tracking</span>
                                                <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100">Active</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}

export default Settings;
