import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Re-import contexts directly so we can probe them without their throwing hooks.
import { AuthContext } from "@/contexts/AuthContext";
import { AdminViewContext } from "@/contexts/AdminViewContext";

/**
 * Test-safe variant of useIsAdmin: returns { isAdmin: false } when rendered
 * without AuthProvider / AdminViewProvider instead of throwing. Used by
 * wizard debug panels so unit tests that mount steps in isolation don't crash.
 */
export function useIsAdminSafe(): { isAdmin: boolean } {
  const auth = useContext(AuthContext);
  const adminView = useContext(AdminViewContext);
  const userId = auth?.user?.id;

  const { data: isRealAdmin = false } = useQuery({
    queryKey: ["is-admin-safe", userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const isAdminView = adminView?.isAdminView ?? true;
  return { isAdmin: !!isRealAdmin && isAdminView };
}
