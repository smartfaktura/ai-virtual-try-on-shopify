import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useCredits } from "@/contexts/CreditContext";
import { canCreateBrandScenes } from "@/features/brand-scenes/access";
import { BrandSceneWizard as Wizard } from "@/features/brand-scenes/wizard/BrandSceneWizard";

export default function BrandSceneWizardPage() {
  const { isRealAdmin, isLoading } = useIsAdmin();
  const { plan, isLoading: creditsLoading } = useCredits();

  // Hide the global StudioChat support bubble inside the wizard.
  useEffect(() => {
    document.body.setAttribute("data-hide-studio-chat", "1");
    return () => {
      document.body.removeAttribute("data-hide-studio-chat");
    };
  }, []);

  if (isLoading || creditsLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading
      </div>
    );
  }

  if (!isRealAdmin && !canCreateBrandScenes(plan)) {
    return <Navigate to="/app/brand-scenes" replace />;
  }

  return (
    <>
      <SEOHead
        title="Brand Scene Wizard — VOVV.AI"
        description="Admin preview of the Brand Scenes wizard"
        noindex
      />
      <Wizard />
    </>
  );
}
