import { useEffect, useMemo, useState } from "react";
import { Check, X, RotateCcw, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type MCQ = {
  type: "mcq";
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  sourceRef: string;
};
export type Short = {
  type: "short";
  prompt: string;
  modelAnswer: string;
  keywords: string[];
  explanation: string;
  sourceRef: string;
};
export type Question = MCQ | Short;

type Progress = Record<number, { correct: boolean; ts: number }>;

export function TrainMode({ materialId, questions }: { materialId: string; questions: Question[] }) {
  const storageKey = `crampad:progress:${materialId}`;
  const [progress, setProgress] = useState<Progress>({});
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setProgress(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {}
  }, [progress, storageKey]);

  const q = questions[i];
  const stats = useMemo(() => {
    const entries = Object.values(progress);
    const correct = entries.filter((e) => e.correct).length;
    return { answered: entries.length, correct, total: questions.length };
  }, [progress, questions.length]);

  function reset() {
    setProgress({});
    setI(0);
    setPicked(null);
    setAnswer("");
    setRevealed(false);
  }

  function next() {
    setPicked(null);
    setAnswer("");
    setRevealed(false);
    setI((p) => (p + 1) % questions.length);
  }

  function submitMcq(idx: number) {
    if (revealed) return;
    setPicked(idx);
    setRevealed(true);
    const correct = idx === (q as MCQ).correctIndex;
    setProgress((p) => ({ ...p, [i]: { correct, ts: Date.now() } }));
  }

  function submitShort() {
    if (revealed) return;
    setRevealed(true);
    const kws = (q as Short).keywords.map((k) => k.toLowerCase());
    const hit = kws.filter((k) => answer.toLowerCase().includes(k)).length;
    const correct = kws.length === 0 ? answer.trim().length > 20 : hit / kws.length >= 0.5;
    setProgress((p) => ({ ...p, [i]: { correct, ts: Date.now() } }));
  }

  const pct = stats.total ? (stats.answered / stats.total) * 100 : 0;
  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Question {i + 1} of {questions.length}
          </span>
          <span className="text-muted-foreground">
            {stats.correct}/{stats.answered} correct · {accuracy}% accuracy
          </span>
        </div>
        <Progress value={pct} className="mt-2 h-1.5" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">
          {q.type === "mcq" ? "Multiple choice" : "Short answer"}
        </div>
        <h3 className="text-lg font-semibold leading-snug">{q.prompt}</h3>

        {q.type === "mcq" ? (
          <div className="mt-4 space-y-2">
            {q.choices.map((c, idx) => {
              const isCorrect = idx === q.correctIndex;
              const isPicked = picked === idx;
              return (
                <button
                  key={idx}
                  onClick={() => submitMcq(idx)}
                  disabled={revealed}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left text-sm transition",
                    !revealed && "hover:border-accent hover:bg-accent/5",
                    revealed && isCorrect && "border-success bg-success/10",
                    revealed && isPicked && !isCorrect && "border-destructive bg-destructive/10",
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-xs font-semibold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{c}</span>
                  {revealed && isCorrect && <Check className="h-4 w-4 text-success" />}
                  {revealed && isPicked && !isCorrect && (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer…"
              className="min-h-[120px]"
              disabled={revealed}
            />
            {!revealed && (
              <Button onClick={submitShort} disabled={answer.trim().length < 3}>
                Check answer
              </Button>
            )}
          </div>
        )}

        {revealed && (
          <div className="mt-5 space-y-3 rounded-lg border border-border bg-secondary/50 p-4">
            {q.type === "short" && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Model answer
                </div>
                <p className="mt-1 text-sm">{q.modelAnswer}</p>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Explanation
              </div>
              <p className="mt-1 text-sm">{q.explanation}</p>
            </div>
            <div className="flex items-start gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="italic">"{q.sourceRef}"</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset progress
        </Button>
        <Button onClick={next} disabled={!revealed && q.type === "mcq" ? picked === null : !revealed}>
          Next question <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
