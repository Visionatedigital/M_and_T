import { useEffect, useState } from "react";
import { supabase, isSupabaseOffline } from "@/integrations/supabase/client";
import { api } from "@/services/api";

export const useUserRole = () => {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                let currentUserId = null;
                let currentRole = null;

                let session = null;
                try {
                    // Only try Supabase if not in hard offline mode
                    if (!isSupabaseOffline) {
                        const { data } = await supabase.auth.getSession();
                        session = data.session;
                    }
                } catch (e) {
                    console.warn("Supabase session check failed", e);
                }

                if (session) {
                    currentUserId = session.user.id;
                } else if (isSupabaseOffline) {
                    // Try local mock session
                    try {
                        const localUser = await api.auth.getMe();
                        if (localUser) {
                            currentUserId = localUser.id || localUser.user_id;
                            currentRole = localUser.role;
                        }
                    } catch (e) {
                        console.warn("No local session found");
                    }
                }

                if (!currentUserId) {
                    setLoading(false);
                    return;
                }

                if (currentRole) {
                    setRole(currentRole);
                    setLoading(false);
                    return;
                }

                const { data: roles, error } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", session.user.id);

                if (error) {
                    console.error("Error fetching user role:", error);
                    setLoading(false);
                    return;
                }

                if (roles && roles.length > 0) {
                    // Prioritize admin role if user has multiple roles
                    const adminRole = roles.find((r) => r.role === "admin");
                    setRole(adminRole ? "admin" : roles[0].role);
                }
            } catch (error) {
                console.error("Error in useUserRole:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    return { role, loading };
};
