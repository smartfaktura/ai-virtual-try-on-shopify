import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useCredits } from "@/contexts/CreditContext";
import { canCreateBrandScenes } from "@/features/brand-scenes/access";
import { BrandSceneWizard as Wizard } from "@/features/brand-scenes/wizard/BrandSceneWizard";

export default function BrandSceneWizardPage() {
  const navigate = useNavigate();
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
        description="Design a signature scene saved to your brand"
        noindex
      />
      <div className="max-w-2xl mx-auto w-full">
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/brand-scenes")}
            className="gap-1.5 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Brand Scenes
          </Button>
        </div>
        <Wizard />
      </div>
    </>
  );
}
