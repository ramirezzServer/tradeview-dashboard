import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/public/PageMeta";
import { PublicFooter } from "@/components/public/PublicFooter";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <PageMeta title="Page not found | TradeView Dashboard" robots="noindex,nofollow" />
      <div className="w-full max-w-sm">
        <main className="text-center glass-card rounded-2xl p-7" aria-labelledby="not-found-title">
          <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="text-app-xs uppercase tracking-[0.18em] text-muted-foreground/40 font-semibold">404</p>
          <h1 id="not-found-title" className="mt-2 text-xl font-bold text-foreground">Page not found</h1>
          <p className="mt-2 text-app-sm text-muted-foreground/50 leading-relaxed">
            This TradeView page is unavailable or may have moved.
          </p>
          <Button asChild className="mt-6">
            <Link to={isAuthenticated ? "/" : "/login"}>
              {isAuthenticated ? "Back to dashboard" : "Go to sign in"}
            </Link>
          </Button>
        </main>
        <PublicFooter />
      </div>
    </div>
  );
};

export default NotFound;
