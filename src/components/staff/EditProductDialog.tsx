import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface EditProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: any;
    onSuccess: () => void;
}

export function EditProductDialog({ open, onOpenChange, product, onSuccess }: EditProductDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        min_amount: "",
        max_amount: "",
        base_interest_rate: "",
        status: "",
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                code: product.code || "",
                min_amount: product.min_amount?.toString() || "",
                max_amount: product.max_amount?.toString() || "",
                base_interest_rate: product.base_interest_rate?.toString() || "0",
                status: product.status || "active",
            });
        }
    }, [product]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.products.update(product.id, {
                ...formData,
                min_amount: parseFloat(formData.min_amount),
                max_amount: parseFloat(formData.max_amount),
                base_interest_rate: parseFloat(formData.base_interest_rate),
            });

            toast({ title: "Success", description: "Product updated successfully" });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update product",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Loan Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) => handleChange("code", e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="min_amount">Min Amount</Label>
                            <Input
                                id="min_amount"
                                type="number"
                                value={formData.min_amount}
                                onChange={(e) => handleChange("min_amount", e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="max_amount">Max Amount</Label>
                            <Input
                                id="max_amount"
                                type="number"
                                value={formData.max_amount}
                                onChange={(e) => handleChange("max_amount", e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                            <Input
                                id="interest_rate"
                                type="number"
                                step="0.1"
                                value={formData.base_interest_rate}
                                onChange={(e) => handleChange("base_interest_rate", e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
