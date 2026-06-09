import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

import email1 from "@/emails/fashion-welcome/01-welcome.html?raw";
import email2 from "@/emails/fashion-welcome/02-first-gen.html?raw";
import email3 from "@/emails/fashion-welcome/03-more-angles.html?raw";
import email4 from "@/emails/fashion-welcome/04-fashion-scenes.html?raw";
import email5 from "@/emails/fashion-welcome/05-product-swap.html?raw";
import email6 from "@/emails/fashion-welcome/06-brand-look.html?raw";
import email7 from "@/emails/fashion-welcome/07-upgrade.html?raw";

interface EmailMeta {
  num: number;
  timing: string;
  condition?: string;
  subject: string;
  preheader: string;
  cta: string;
  html: string;
}

const EMAILS: EmailMeta[] = [
  {
    num: 1,
    timing: "Send immediately after signup",
    subject: "Your next product shoot can start with one photo",
    preheader: "Upload one fashion product and turn it into visuals for your store, ads and social content",
    cta: "Start Creating → /app/generate/product-images",
    html: email1,
  },
  {
    num: 2,
    timing: "Day 2",
    condition: "Only if contact.total_generations = 0",
    subject: "Try it with your easiest product first",
    preheader: "Pick one hoodie, dress, pair of jeans, swimwear piece or sock product and generate your first visual",
    cta: "Create Your First Visual → /app/generate/product-images",
    html: email2,
  },
  {
    num: 3,
    timing: "Day 5",
    subject: "One product image rarely sells the full product",
    preheader: "Create close-ups, side views, back views and wider shots from one original photo",
    cta: "Generate More Angles → /app/generate/product-images",
    html: email3,
  },
  {
    num: 4,
    timing: "Day 9",
    subject: "Your next drop needs more than a product photo",
    preheader: "Create campaign-style visuals for clothing, dresses, swimwear, activewear, lingerie and more",
    cta: "Explore Fashion Scenes → /app/generate/product-images",
    html: email4,
  },
  {
    num: 5,
    timing: "Day 14",
    subject: "One winning scene can sell more than one product",
    preheader: "Use Product Swap to keep the same scene and change the product from your library",
    cta: "Try Product Swap → /app/generate/product-images",
    html: email5,
  },
  {
    num: 6,
    timing: "Day 21",
    subject: "Make every visual feel like your brand",
    preheader: "Use Brand Models and Brand Scenes to create a consistent look across new drops",
    cta: "Build Your Brand Look → /app/brand-models",
    html: email6,
  },
  {
    num: 7,
    timing: "Day 30",
    condition: "Only if contact.plan = free",
    subject: "Ready to create fashion visuals more consistently?",
    preheader: "Scale product pages, drops, ads, emails and social content with one visual workflow",
    cta: "View Plans → /pricing",
    html: email7,
  },
];

export default function EmailPreviewFashionWelcome() {
  const [copiedNum, setCopiedNum] = useState<number | null>(null);

  const copy = async (e: EmailMeta) => {
    await navigator.clipboard.writeText(e.html);
    setCopiedNum(e.num);
    toast.success(`Email ${e.num} HTML copied`);
    setTimeout(() => setCopiedNum((n) => (n === e.num ? null : n)), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight">Fashion Visual Growth Sequence</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          7 emails triggered by user.signup_completed for fashion primary_category users. Paste each
          HTML into Resend. Sender: Tomas from VOVV — tomas@vovv.ai
        </p>
      </header>

      <div className="space-y-10">
        {EMAILS.map((e) => (
          <Card key={e.num} className="overflow-hidden">
            <div className="p-6 border-b space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">Email {e.num}</Badge>
                  <Badge variant="secondary">{e.timing}</Badge>
                  {e.condition && <Badge variant="outline">{e.condition}</Badge>}
                </div>
                <Button size="sm" onClick={() => copy(e)}>
                  {copiedNum === e.num ? (
                    <><Check className="w-4 h-4 mr-2" /> Copied</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Copy HTML</>
                  )}
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Subject</p>
                <p className="text-base font-medium">{e.subject}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Preheader</p>
                <p className="text-sm text-muted-foreground">{e.preheader}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">CTA</p>
                <p className="text-sm font-mono">{e.cta}</p>
              </div>
            </div>
            <div className="bg-muted/30 p-6">
              <iframe
                srcDoc={e.html}
                title={`Email ${e.num} preview`}
                className="w-full bg-white rounded border"
                style={{ height: 900, maxWidth: 640, margin: "0 auto", display: "block" }}
                sandbox=""
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
