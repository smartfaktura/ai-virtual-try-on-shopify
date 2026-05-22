import { useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/contexts/AuthContext";
import { AdminViewContext } from "@/contexts/AdminViewContext";

/**
 * Test-safe variant of useIsAdmin: returns { isAdmin: false } when rendered
 * without AuthProvider / QueryClientProvider instead of throwing. Used by
 * wizard debug panels so unit tests that mount steps in isolation don't crash.
 */
export function useIsAdminSafe(): { isAdmin: boolean } {
  const auth = useContext(AuthContext);
  const adminView = useContext(AdminViewContext);
  const userId = auth?.user?.id;
  const [isRealAdmin, setIsRealAdmin] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsRealAdmin(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) setIsRealAdmin(!!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isAdminView = adminView?.isAdminView ?? true;
  return { isAdmin: isRealAdmin && isAdminView };
}
