import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BookOpen, FileText, Upload, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createMaterial } from "@/lib/study.functions";
import { extractPdfText } from "@/lib/pdf-extract";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CramPad — Last-minute exam study & training" },
      {
        name: "description",
        content:
          "Paste or upload your pre-exam material. Get an instant AI study guide and adaptive practice questions.",
      },
      { property: "og:title", content: "CramPad — Last-minute exam prep" },
      {
        property: "og:description",
        content:
          "Turn the material released before your exam into structured notes and practice questions in seconds.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const create = useServerFn(createMaterial);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        toast.info("Reading PDF…");
        const t = await extractPdfText(file);
        setText(t);
        toast.success(`Loaded ${t.length.toLocaleString()} characters`);
      } else {
        const t = await file.text();
        setText(t);
        toast.success(`Loaded ${t.length.toLocaleString()} characters`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not read that file");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 50) {
      toast.error("Paste at least a few paragraphs of material.");
      return;
    }
    setLoading(true);
    try {
      const res = await create({ data: { text, title: title || undefined } });
      navigate({ to: "/m/$id", params: { id: res.id } });
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Try again with shorter material.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CramPad</span>
        </div>
        <a
          href="https://docs.lovable.dev"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          About
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-8 md:pt-16">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI study guide + practice in seconds
          </div>
          <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
            Two days to the exam.
            <br />
            <span className="italic text-accent">Make them count.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            Drop in the material your professors just released. Get a clean study
            guide and a training mode with auto-graded practice.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft md:p-7"
        >
          <label className="text-sm font-medium">Material title (optional)</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Microeconomics — Final exam reader"
            className="mt-2"
            disabled={loading}
          />

          <div className="mt-5 flex items-center justify-between">
            <label className="text-sm font-medium">Paste the material</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm transition hover:bg-accent hover:text-accent-foreground">
              <Upload className="h-4 w-4" />
              {filename ? "Replace file" : "Upload PDF or .txt"}
              <input
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain"
                className="hidden"
                onChange={onFile}
                disabled={loading}
              />
            </label>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste lecture notes, the exam reader, or anything your professors said to study…"
            className="mt-2 min-h-[260px] resize-y font-mono text-sm"
            disabled={loading}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {filename ?? "No file"}
            </span>
            <span>{text.length.toLocaleString()} / 60,000 chars</span>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Building your study pack…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate study guide & practice
              </>
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            No account required. Anyone with the link to your pack can view it.
          </p>
        </form>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { t: "Structured notes", d: "Summary, key concepts, section-by-section breakdown." },
            { t: "Practice questions", d: "MCQ + short answer with instant feedback." },
            { t: "Progress saved", d: "Your answers and streaks stay in this browser." },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur"
            >
              <div className="text-sm font-semibold">{f.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
