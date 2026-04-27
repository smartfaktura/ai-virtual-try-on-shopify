import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home, LayoutDashboard, Sparkles, Video, Image as ImageIcon, Compass } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Product Images", to: "/app/generate/product-images", Icon: ImageIcon },
  { label: "Video Studio", to: "/app/video", Icon: Video },
  { label: "Explore", to: "/app/discover", Icon: Compass },
  { label: "Pricing", to: "/pricing", Icon: Sparkles },
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SEOHead
        title="Page Not Found — VOVV.AI"
        description="The page you're looking for doesn't exist."
        noindex
      />

      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.10), transparent 70%), radial-gradient(40% 35% at 85% 100%, hsl(var(--primary) / 0.08), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      {/* Brand */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-base font-bold tracking-tight hover:opacity-80 transition"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-foreground" />
          VOVV.AI
        </Link>
        <Link
          to="/pricing"
          className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition"
        >
          Pricing
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6 pb-20">
        <div className="w-full max-w-2xl text-center">
          {/* Path echo */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card/60 backdrop-blur px-3.5 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            <span className="font-mono">{location.pathname || "/"}</span>
            <span className="text-muted-foreground/60">·</span>
            <span>not found</span>
          </div>

          {/* Big 404 */}
          <h1
            className="select-none bg-gradient-to-b from-foreground to-foreground/30 bg-clip-text text-transparent text-[120px] sm:text-[160px] md:text-[200px] font-bold leading-none tracking-tighter"
            aria-label="404 page not found"
          >
            404
          </h1>

          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            This page took a wrong turn
          </p>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              className="rounded-full h-11 px-6 text-sm font-semibold bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90 w-full sm:w-auto"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-11 px-6 text-sm font-semibold w-full sm:w-auto"
            >
              <Link to="/app">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to App
              </Link>
            </Button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition px-2 py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
          </div>

          {/* Quick links */}
          <div className="mt-14">
            <p className="mb-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Popular destinations
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickLinks.map(({ label, to, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group rounded-2xl border bg-card/60 backdrop-blur p-4 text-left hover:bg-accent hover:-translate-y-0.5 hover:shadow-sm transition-all"
                >
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
                  <div className="mt-3 text-sm font-medium">{label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
