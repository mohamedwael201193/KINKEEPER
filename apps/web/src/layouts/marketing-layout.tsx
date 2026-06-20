import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function MarketingNav() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-ink/10 bg-ink px-4 py-2 text-canvas shadow-card">
        <Link to="/" className="flex items-center gap-2 pl-2">
          <span className="font-serif text-lg">KINKEEPER</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#how-it-works" className="text-canvas/80 hover:text-canvas">
            How it works
          </a>
          <a href="#evidence" className="text-canvas/80 hover:text-canvas">
            Evidence
          </a>
          <a href="#faq" className="text-canvas/80 hover:text-canvas">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button asChild variant="secondary" size="sm" className="bg-canvas text-ink hover:bg-canvas/90">
              <Link to="/app">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-canvas hover:bg-white/10 hover:text-canvas">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="bg-canvas text-ink hover:bg-canvas/90">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
