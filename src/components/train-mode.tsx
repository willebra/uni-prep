import { useEffect, useMemo, useState } from "react";
import { Check, X, RotateCcw, ChevronRight, Quote, SkipForward, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Base = {
  id?: string;
  level?: number;
  context?: string;
  explanation: string;
  sourceRef?: string;
};
export type Flashcard = Base & { type: "flashcard"; prompt: string; back: string };
export type TF = Base & { type: "tf"; prompt: string; correct: boolean };
export type MCQ = Base & {
  type: "mcq";
  prompt: string;
  choices: string[];
  correctIndex: number;
};
export type Numeric = Base & {
  type: "numeric";
  prompt: string;
  correctAnswer: number;
  tolerance?: number;
  unit?: string;
};
export type Short = Base & {
  type: "short";
  prompt: string;
  modelAnswer: string;
  keywords: string[];
};
export type Question = Flashcard | TF | MCQ | Numeric | Short;

type Outcome = "correct" | "wrong" | "skipped" | "studied";
type Entry = { outcome: Outcome; points: number; ts: number };
type Progress = Record<number, Entry>;

// Viralliset pisteytyskaavat
const SCORE = {
  tf: { correct: 1.1, wrong: -0.4, skip: -0.2 },
  mcq: { correct: 2.2, wrong: -0.7, skip: -0.2 },
  numeric: { correct: 2.2, wrong: -0.7, skip: -0.2 },
} as const;

function scoreFor(q: Question, outcome: Outcome): number {
  if (q.type === "flashcard" || q.type === "short") return 0;
  const s = SCORE[q.type];
  if (outcome === "correct") return s.correct;
  if (outcome === "wrong") return s.wrong;
  if (outcome === "skipped") return s.skip;
  return 0;
}

function typeLabel(t: Question["type"]): string {
  switch (t) {
    case "flashcard":
      return "Käsitekortti";
    case "tf":
      return "Tosi / epätosi";
    case "mcq":
      return "Monivalinta";
    case "numeric":
      return "Laskutehtävä";
    case "short":
      return "Lyhyt vastaus";
  }
}

export function TrainMode({ materialId, questions }: { materialId: string; questions: Question[] }) {
  const storageKey = `crampad:progress:${materialId}`;
  const [progress, setProgress] = useState<Progress>({});
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [tfPick, setTfPick] = useState<boolean | null>(null);
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
      window.dispatchEvent(new Event("crampad:progress"));
    } catch {}
  }, [progress, storageKey]);

  const q = questions[i];

  const stats = useMemo(() => {
    const entries = Object.values(progress);
    const correct = entries.filter((e) => e.outcome === "correct").length;
    const wrong = entries.filter((e) => e.outcome === "wrong").length;
    const skipped = entries.filter((e) => e.outcome === "skipped").length;
    const points = entries.reduce((s, e) => s + (e.points || 0), 0);
    return { answered: entries.length, correct, wrong, skipped, points, total: questions.length };
  }, [progress, questions.length]);

  function record(outcome: Outcome) {
    const points = scoreFor(q, outcome);
    setProgress((p) => ({ ...p, [i]: { outcome, points, ts: Date.now() } }));
    setRevealed(true);
  }

  function reset() {
    setProgress({});
    setI(0);
    setPicked(null);
    setTfPick(null);
    setAnswer("");
    setRevealed(false);
  }

  function next() {
    setPicked(null);
    setTfPick(null);
    setAnswer("");
    setRevealed(false);
    setI((p) => (p + 1) % questions.length);
  }

  function submitMcq(idx: number) {
    if (revealed) return;
    setPicked(idx);
    const correct = idx === (q as MCQ).correctIndex;
    record(correct ? "correct" : "wrong");
  }

  function submitTf(value: boolean) {
    if (revealed) return;
    setTfPick(value);
    const correct = value === (q as TF).correct;
    record(correct ? "correct" : "wrong");
  }

  function submitNumeric() {
    if (revealed) return;
    const n = Number(answer.replace(",", "."));
    if (Number.isNaN(n)) return;
    const target = (q as Numeric).correctAnswer;
    const tol = (q as Numeric).tolerance ?? 0.05;
    const correct = Math.abs(n - target) <= tol;
    record(correct ? "correct" : "wrong");
  }

  function submitShort() {
    if (revealed) return;
    const kws = (q as Short).keywords.map((k) => k.toLowerCase());
    const hit = kws.filter((k) => answer.toLowerCase().includes(k)).length;
    const correct = kws.length === 0 ? answer.trim().length > 20 : hit / kws.length >= 0.5;
    record(correct ? "correct" : "wrong");
  }

  function skipQuestion() {
    if (revealed) return;
    record("skipped");
  }

  function flashcardRate(known: boolean) {
    record(known ? "correct" : "wrong");
  }

  const pct = stats.total ? (stats.answered / stats.total) * 100 : 0;
  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium">
            Tehtävä {i + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {stats.correct} oikein · {stats.wrong} väärin · {stats.skipped} tyhjää
            </span>
            <span className="font-semibold text-foreground">
              {stats.points.toFixed(2).replace(".", ",")} p
            </span>
            <span>· {accuracy} % osuvuus</span>
          </div>
        </div>
        <Progress value={pct} className="mt-2 h-1.5" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium uppercase tracking-wider text-accent">
            {typeLabel(q.type)}
          </span>
          {q.level && (
            <Badge variant="secondary" className="text-[10px]">
              Taso {q.level}
            </Badge>
          )}
        </div>

        {q.context && (
          <div className="mb-4 whitespace-pre-wrap rounded-lg border border-dashed border-border bg-secondary/40 p-3 text-sm text-foreground/90">
            {q.context}
          </div>
        )}

        <h3 className="text-lg font-semibold leading-snug">{q.prompt}</h3>

        {q.type === "mcq" && (
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
                    "flex w-full items-center gap-3 rounded-lg border bg-background p-3 text-left text-sm transition",
                    !revealed && "border-accent/40 shadow-sm hover:border-accent hover:bg-accent/10",
                    revealed && !isCorrect && !isPicked && "border-border",
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
        )}

        {q.type === "tf" && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: "Tosi", value: true },
              { label: "Epätosi", value: false },
            ].map((opt) => {
              const isCorrect = opt.value === q.correct;
              const isPicked = tfPick === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => submitTf(opt.value)}
                  disabled={revealed}
                  className={cn(
                    "rounded-lg border bg-background p-3 text-sm font-medium transition",
                    !revealed && "border-accent bg-accent/10 shadow-sm hover:bg-accent hover:text-accent-foreground",
                    revealed && !isCorrect && !isPicked && "border-border",
                    revealed && isCorrect && "border-success bg-success/10",
                    revealed && isPicked && !isCorrect && "border-destructive bg-destructive/10",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "numeric" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Numeerinen vastaus"
                inputMode="decimal"
                className="max-w-[240px]"
                disabled={revealed}
              />
              {q.unit && <span className="text-sm text-muted-foreground">{q.unit}</span>}
            </div>
            {!revealed && (
              <Button
                onClick={submitNumeric}
                disabled={answer.trim().length === 0}
                className="bg-accent text-accent-foreground shadow-md hover:bg-accent/90"
              >
                Tarkista
              </Button>
            )}
            {revealed && (
              <p className="text-sm">
                Oikea vastaus:{" "}
                <span className="font-semibold">
                  {q.correctAnswer.toString().replace(".", ",")}
                  {q.unit ? ` ${q.unit}` : ""}
                </span>
              </p>
            )}
          </div>
        )}

        {q.type === "short" && (
          <div className="mt-4 space-y-3">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Kirjoita vastauksesi…"
              className="min-h-[120px]"
              disabled={revealed}
            />
            {!revealed && (
              <Button onClick={submitShort} disabled={answer.trim().length < 3}>
                Tarkista
              </Button>
            )}
          </div>
        )}

        {q.type === "flashcard" && (
          <div className="mt-4 space-y-3">
            {!revealed ? (
              <Button
                onClick={() => setRevealed(true)}
                size="lg"
                className="w-full bg-accent text-accent-foreground shadow-md hover:bg-accent/90"
              >
                <Eye className="mr-2 h-5 w-5" /> Tarkista selitys tästä
              </Button>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm">
                  {q.back}
                </div>
                {!progress[i] && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => flashcardRate(false)}
                      className="bg-accent text-accent-foreground shadow-md hover:bg-accent/90"
                    >
                      <X className="mr-2 h-4 w-4" /> En osannut
                    </Button>
                    <Button
                      onClick={() => flashcardRate(true)}
                      className="bg-accent text-accent-foreground shadow-md hover:bg-accent/90"
                    >
                      <Check className="mr-2 h-4 w-4" /> Osasin
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {(q.type === "mcq" || q.type === "tf" || q.type === "numeric") && !revealed && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={skipQuestion}>
              <SkipForward className="mr-2 h-4 w-4" /> Jätän vastaamatta (−0,2 p)
            </Button>
          </div>
        )}

        {revealed && (
          <div className="mt-5 space-y-3 rounded-lg border border-border bg-secondary/50 p-4">
            {q.type === "short" && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mallivastaus
                </div>
                <p className="mt-1 text-sm">{q.modelAnswer}</p>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Selitys
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{q.explanation}</p>
            </div>
            {q.sourceRef && (
              <div className="flex items-start gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="italic">"{q.sourceRef}"</span>
              </div>
            )}
            {progress[i] && (
              <div className="border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">Pisteet tästä tehtävästä: </span>
                <span
                  className={cn(
                    "font-semibold",
                    progress[i].points > 0 && "text-success",
                    progress[i].points < 0 && "text-destructive",
                  )}
                >
                  {progress[i].points > 0 ? "+" : ""}
                  {progress[i].points.toFixed(2).replace(".", ",")} p
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Nollaa edistyminen
        </Button>
        <Button
          onClick={next}
          disabled={!revealed}
          size="lg"
          className={cn(
            "shadow-md transition-all",
            revealed && (q.type !== "flashcard" || progress[i]) &&
              "bg-accent text-accent-foreground hover:bg-accent/90 ring-2 ring-accent/50 ring-offset-2 ring-offset-background hover:shadow-lg motion-safe:animate-pulse",
          )}
        >
          Seuraava tehtävä <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
