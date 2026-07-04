import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import "@/lib/fonts";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          404 · Not found
        </p>
        <h1 className="mt-6 font-display text-6xl text-foreground">
          This page slipped through.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The link is broken or the page has moved. Let's get you back on track.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-destructive">
          Something broke
        </p>
        <h1 className="mt-6 font-display text-5xl text-foreground">
          We hit a snag loading this.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Try again — if it keeps happening, refresh the page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ResumeForge AI — ATS-ready resumes for every career stage" },
      {
        name: "description",
        content:
          "AI-powered resume builder for students, early-career, and senior professionals across engineering, data, product, design, and business. Targets two roles, real ATS scoring, LaTeX + PDF export.",
      },
      { name: "author", content: "ResumeForge AI" },
      {
        property: "og:title",
        content: "ResumeForge AI — ATS-ready resumes for every career stage",
      },
      {
        property: "og:description",
        content:
          "Build a recruiter-ready resume — for students, career-switchers, or senior pros. Optimized for two target roles with a real ATS score. LaTeX + PDF export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b0a12" },
      { property: "og:title", content: "ResumeForge AI — ATS-ready resumes for every career stage" },
      { name: "twitter:title", content: "ResumeForge AI — ATS-ready resumes for every career stage" },
      { name: "description", content: "AI-powered resume builder for students, early-career, and senior professionals across engineering, data, product, design, and business. Targets two roles, real ATS scoring, LaTeX + PDF export." },
      { property: "og:description", content: "AI-powered resume builder for students, early-career, and senior professionals across engineering, data, product, design, and business. Targets two roles, real ATS scoring, LaTeX + PDF export." },
      { name: "twitter:description", content: "AI-powered resume builder for students, early-career, and senior professionals across engineering, data, product, design, and business. Targets two roles, real ATS scoring, LaTeX + PDF export." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/86a44046-db08-4c97-ba57-819371265857" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/86a44046-db08-4c97-ba57-819371265857" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
