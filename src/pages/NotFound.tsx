import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Image as ImageIcon, Video, Compass } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const quickLinks = [
  { label: "Product Images", desc: "Generate on-brand product visuals", to: "/app/generate/product-images", Icon: ImageIcon },
  { label: "Video Studio", desc: "Create short product videos", to: "/app/video", Icon: Video },
  { label: "Explore", desc: "Browse 800+ scene presets", to: "/app/discover", Icon: Compass },
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-foreground">
      <SEOHead
        title="Page not found — VOVV.AI"
        description="The page you're looking for doesn't exist."
        noindex
      />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="space-y-14 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* Hero */}
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
              404 — Page not found
            </p>

            <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold text-foreground tracking-[-0.03em] leading-[1.08] mb-6">
              This page took a wrong turn
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              The page you're looking for doesn't exist or has been moved — let's get you back on track
            </p>

            {location.pathname && (
              <p className="mt-6 inline-block font-mono text-xs text-muted-foreground/70 bg-foreground/[0.04] px-3 py-1.5 rounded-full">
                {location.pathname}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5 text-center">
              Where to next
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickLinks.map(({ label, desc, to, Icon }, i) => (
                <Link
                  key={to}
                  to={to}
                  className="group block bg-white rounded-3xl border border-[#f0efed] shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-500"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-9 h-9 rounded-xl bg-foreground/[0.04] flex items-center justify-center text-foreground/70 mb-4 group-hover:bg-foreground/[0.06] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col items-center gap-5 pt-6">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Back to home
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/60 font-medium hover:text-foreground transition-colors"
            >
              Or go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
