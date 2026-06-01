import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  FileText,
  Upload,
  Sparkles,
  Loader2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createMaterial, listMaterials } from "@/lib/study.functions";
import { extractPdfText } from "@/lib/pdf-extract";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CramPad — Last-minute exam study & training" },
      {
        name: "description",
        content:
          "Browse ready-made study packs or paste your own material. Get an AI study guide and adaptive practice questions.",
      },
      { property: "og:title", content: "CramPad — Last-minute exam prep" },
      {
        property: "og:description",
        content:
          "Browse ready-made exam study packs, or turn fresh material into structured notes and practice questions in seconds.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [view, setView] = useState<"library" | "create">("library");

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CramPad</span>
        </div>
        {view === "library" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("create")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add material
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("library")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to library
          </Button>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-4 md:pt-10">
        {view === "library" ? <LibraryView /> : <CreateView />}
      </main>
    </div>
  );
}

function LibraryView() {
  const list = useServerFn(listMaterials);
  const { data, isLoading, error } = useQuery({
    queryKey: ["materials"],
    queryFn: () => list(),
  });

  return (
    <>
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Library className="h-3.5 w-3.5 text-accent" />
          Ready-made study packs
        </div>
        <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
          Pick a course.
          <br />
          <span className="italic text-accent">Start training.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          Browse the study packs published for upcoming exams. Each one has a
          full study guide and instant practice questions.
        </p>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Couldn't load the library. Try refreshing.
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((m) => (
            <Link
              key={m.id}
              to="/m/$id"
              params={{ id: m.id }}
              className="group block rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-accent/60 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-2xl leading-tight text-foreground">
                  {m.title}
                </h2>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              {m.summary ? (
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {m.summary}
                </p>
              ) : null}
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{m.sectionCount} sections</span>
                <span aria-hidden>·</span>
                <span>{m.conceptCount} key concepts</span>
                <span aria-hidden>·</span>
                <span>{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function EmptyLibrary() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
        <Library className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl">No study packs yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Be the first to add material. Paste a reader, upload a PDF, and we'll
        generate a study guide and practice questions.
      </p>
    </div>
  );
}

function CreateView() {
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
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          AI study guide + practice in seconds
        </div>
        <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
          Add new material.
          <br />
          <span className="italic text-accent">Make it count.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          Drop in a reader or notes. We'll generate a clean study guide and a
          training mode with auto-graded practice.
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
    </div>
  );
}
