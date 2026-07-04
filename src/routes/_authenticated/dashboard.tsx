import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Copy,
  Trash2,
  Download,
  Gauge,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import type { StoredResume } from "@/lib/resume-types";
import { emptyResumeData } from "@/lib/resume-types";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as StoredResume[];
    },
    enabled: !!user,
  });

  const createResume = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user!.id,
          title: "Untitled resume",
          data: emptyResumeData() as unknown as never,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as StoredResume;
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["resumes"] });
      window.location.href = `/resume/${r.id}/wizard/roles`;
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const duplicateResume = useMutation({
    mutationFn: async (r: StoredResume) => {
      const { error } = await supabase.from("resumes").insert({
        user_id: user!.id,
        title: `${r.title} (copy)`,
        target_roles: r.target_roles,
        data: r.data as unknown as never,
        template: r.template,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Duplicated");
    },
  });

  const deleteResume = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resumes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Deleted");
    },
  });

  return (
    <div className="min-h-screen app-aurora bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-glow">
              Dashboard
            </p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl">
              Your resumes
            </h1>
            <p className="mt-3 text-muted-foreground">
              {resumes.length} {resumes.length === 1 ? "resume" : "resumes"} · signed in as{" "}
              <span className="text-foreground">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={() => createResume.mutate()}
            disabled={createResume.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            New resume
          </button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-border bg-surface"
              />
            ))
          ) : resumes.length === 0 ? (
            <EmptyState onCreate={() => createResume.mutate()} />
          ) : (
            resumes.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ResumeCard
                  resume={r}
                  onDuplicate={() => duplicateResume.mutate(r)}
                  onDelete={() => {
                    if (confirm(`Delete "${r.title}"?`)) deleteResume.mutate(r.id);
                  }}
                />
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="col-span-full">
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/60 glass-panel p-16 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="relative mt-6 font-display text-4xl">Build your first resume</h2>
        <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
          Guided workflow, no upload required. Optimized for two AI roles you
          choose.
        </p>
        <button
          onClick={onCreate}
          className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Create resume
        </button>
      </div>
    </div>
  );
}

function ResumeCard({
  resume,
  onDuplicate,
  onDelete,
}: {
  resume: StoredResume;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const score = resume.ats_score;
  const scoreColor =
    score == null
      ? "text-muted-foreground"
      : score >= 90
        ? "text-success"
        : score >= 70
          ? "text-highlight"
          : "text-destructive";

  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl glass p-6 transition-all hover:-translate-y-0.5 hover:shadow-elegant">
      <div>
        <div className="flex items-start justify-between">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-primary-glow">
            <FileText className="h-5 w-5" />
          </div>
          <div className={`text-right font-mono ${scoreColor}`}>
            <div className="text-3xl font-medium leading-none">
              {score ?? "—"}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-widest opacity-70">
              ATS
            </div>
          </div>
        </div>
        <h3 className="mt-6 font-display text-2xl leading-tight">{resume.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {resume.target_roles.length
            ? resume.target_roles.join(" · ")
            : "No roles selected yet"}
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Updated {formatDistanceToNow(new Date(resume.updated_at))} ago
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div className="flex gap-1">
          <IconBtn onClick={onDuplicate} label="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn onClick={onDelete} label="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </IconBtn>
          {resume.latex_source && (
            <IconBtn label="Download">
              <Download className="h-3.5 w-3.5" />
            </IconBtn>
          )}
        </div>
        <Link
          to="/resume/$id/wizard/$step"
          params={{ id: resume.id, step: resume.target_roles.length ? "review" : "roles" }}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-glow transition group-hover:gap-2"
        >
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = Gauge;
