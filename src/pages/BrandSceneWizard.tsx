import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { BrandSceneWizard as Wizard } from "@/features/brand-scenes/wizard/BrandSceneWizard";

export default function BrandSceneWizardPage() {
  const { isRealAdmin, isLoading } = useIsAdmin();

  // Hide the global StudioChat support bubble inside the wizard.
  useEffect(() => {
    document.body.setAttribute("data-hide-studio-chat", "1");
    return () => {
      document.body.removeAttribute("data-hide-studio-chat");
    };
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading
      </div>
    );
  }

  if (!isRealAdmin) {
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
