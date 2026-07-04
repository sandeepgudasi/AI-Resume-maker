import { Link } from "@tanstack/react-router";
import { useAuth, signOut } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Moon, Sun, Sparkles } from "lucide-react";

export function SiteHeader() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const qc = useQueryClient();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 glass-strong">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl leading-none">ResumeForge</span>
          <span className="rounded-full border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="/#features" className="transition hover:text-foreground">
            Features
          </a>
          <a href="/#how" className="transition hover:text-foreground">
            How it works
          </a>
          <a href="/#roles" className="transition hover:text-foreground">
            Roles
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent sm:inline-flex"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await signOut(qc);
                  router.navigate({ to: "/auth", replace: true });
                }}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex items-center rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
