import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ResumeData, StoredResume, OptimizedResume, AtsBreakdown } from "./resume-types";
import { emptyResumeData } from "./resume-types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useResume(id: string) {
  return useQuery({
    queryKey: ["resume", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Resume not found");
      return data as unknown as StoredResume;
    },
  });
}

export function useUpdateResume(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      patch: Partial<{
        title: string;
        target_roles: string[];
        data: ResumeData;
        optimized_data: OptimizedResume | null;
        ats_score: number | null;
        ats_breakdown: AtsBreakdown | null;
        template: string;
        latex_source: string | null;
        status: string;
      }>,
    ) => {
      const { error } = await supabase
        .from("resumes")
        .update(patch as unknown as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume", id] });
      qc.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

/** Debounced local state that auto-saves the resume data JSON. */
export function useAutoSaveResumeData(
  id: string,
  initial: ResumeData | undefined,
) {
  const [data, setData] = useState<ResumeData>(initial ?? emptyResumeData());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (initial) setData(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const persist = useCallback(
    async (next: ResumeData) => {
      setSaving(true);
      const { error } = await supabase
        .from("resumes")
        .update({
          data: next as unknown as never,
          target_roles: next.targetRoles,
          title:
            next.personal.fullName
              ? `${next.personal.fullName}${next.targetRoles.length ? " — " + next.targetRoles[0] : ""}`
              : "Untitled resume",
        })
        .eq("id", id);
      setSaving(false);
      if (!error) setSavedAt(new Date());
    },
    [id],
  );

  const update = useCallback(
    (updater: (d: ResumeData) => ResumeData) => {
      setData((prev) => {
        const next = updater(prev);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => persist(next), 700);
        return next;
      });
    },
    [persist],
  );

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    await persist(data);
  }, [data, persist]);

  return { data, update, saving, savedAt, flush };
}
