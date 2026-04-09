
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export type UserRole = 'admin' | 'loan_officer' | 'client' | null;

export const useUserRole = () => {
    const [role, setRole] = useState<UserRole>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const user = await api.auth.getMe();
                if (user) {
                    const normalized = String(user.role || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
                    setRole((normalized || null) as UserRole);
                    setUserId(typeof user.id === "string" ? user.id : user.id != null ? String(user.id) : null);
                } else {
                    setRole(null);
                    setUserId(null);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                setRole(null);
                setUserId(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    return {
        role,
        userId,
        loading,
        isAdmin: role === 'admin',
        isLoanOfficer: role === 'loan_officer',
    };
};
