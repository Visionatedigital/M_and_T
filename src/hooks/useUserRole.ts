
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export type UserRole = 'admin' | 'loan_officer' | 'client' | null;

export const useUserRole = () => {
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const user = await api.auth.getMe();
                if (user) {
                    setRole(user.role as UserRole);
                } else {
                    setRole(null);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    return { role, loading, isAdmin: role === 'admin', isLoanOfficer: role === 'loan_officer' };
};
