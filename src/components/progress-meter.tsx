import { useEffect, useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, XCircle, MinusCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type Outcome = "correct" | "wrong" | "skipped";
type StoredProgress = Record<string, { outcome: Outcome; points?: number; ts?: number }>;

function storageKeyFor(materialId: string) {
  return `crampad:progress:${materialId}`;
}

function readProgress(materialId: string): StoredProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKeyFor(materialId));
    return raw ? (JSON.parse(raw) as StoredProgress) : {};
  } catch {
    return {};
  }
}

/**
 * Reactively reads localStorage progress for a material. Refreshes on mount,
 * on tab visibility change, on cross-tab storage events, and on a custom
 * "crampad:progress" event dispatched by mutators (TrainMode).
 */
export function useMaterialProgress(materialId: string) {
  const [progress, setProgress] = useState<StoredProgress>(() => readProgress(materialId));

  useEffect(() => {
    const refresh = () => setProgress(readProgress(materialId));
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === storageKeyFor(materialId)) refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("crampad:progress", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("crampad:progress", refresh);
    };
  }, [materialId]);

  return progress;
}

export interface MaterialProgressStats {
  answered: number;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  percent: number;
}

export function computeStats(
  progress: StoredProgress,
  total: number,
): MaterialProgressStats {
  const entries = Object.values(progress);
  const answered = entries.length;
  const correct = entries.filter((e) => e.outcome === "correct").length;
  const wrong = entries.filter((e) => e.outcome === "wrong").length;
  const skipped = entries.filter((e) => e.outcome === "skipped").length;
  const percent = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
  return { answered, correct, wrong, skipped, total, percent };
}

/** Compact inline bar for use inside module list cards. */
export function ModuleProgressBar({
  materialId,
  total,
  className,
}: {
  materialId: string;
  total: number;
  className?: string;
}) {
  const progress = useMaterialProgress(materialId);
  const stats = useMemo(() => computeStats(progress, total), [progress, total]);

  if (total === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress value={stats.percent} className="h-1.5 flex-1" />
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {stats.answered}/{stats.total}
      </span>
    </div>
  );
}

/**
 * Full progress meter card. Used at the top of an exam page (sums across many
 * modules) or on a single module page (pass one module).
 */
export function ProgressMeter({
  modules,
  title = "Etenemismittari",
}: {
  modules: { id: string; title: string; total: number }[];
  title?: string;
}) {
  // Subscribe to each module's progress so the meter updates live
  const perModule = modules.map((m) => ({
    ...m,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    progress: useMaterialProgress(m.id),
  }));

  const aggregate = useMemo(() => {
    let answered = 0,
      correct = 0,
      wrong = 0,
      skipped = 0,
      total = 0;
    for (const m of perModule) {
      const s = computeStats(m.progress, m.total);
      answered += s.answered;
      correct += s.correct;
      wrong += s.wrong;
      skipped += s.skipped;
      total += s.total;
    }
    const percent = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
    return { answered, correct, wrong, skipped, total, percent };
  }, [perModule]);

  const completedModules = perModule.filter(
    (m) => m.total > 0 && computeStats(m.progress, m.total).answered >= m.total,
  ).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          <h3 className="font-display text-lg">{title}</h3>
        </div>
        <span className="text-2xl font-display tabular-nums">{aggregate.percent}%</span>
      </div>

      <Progress value={aggregate.percent} className="mt-3 h-2.5" />

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Stat
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />}
          label="Oikein"
          value={aggregate.correct}
        />
        <Stat
          icon={<XCircle className="h-3.5 w-3.5 text-destructive" />}
          label="Väärin"
          value={aggregate.wrong}
        />
        <Stat
          icon={<MinusCircle className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Ohitettu"
          value={aggregate.skipped}
        />
        <Stat
          icon={<Circle className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Tekemättä"
          value={Math.max(0, aggregate.total - aggregate.answered)}
        />
      </div>

      {modules.length > 1 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {aggregate.answered} / {aggregate.total} tehtävää tehty · {completedModules} /
          {" "}
          {modules.length} kokonaisuutta valmiina
        </p>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          {aggregate.answered} / {aggregate.total} tehtävää tehty
        </p>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-2">
      {icon}
      <div className="min-w-0">
        <div className="font-display text-base leading-none tabular-nums">{value}</div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}
