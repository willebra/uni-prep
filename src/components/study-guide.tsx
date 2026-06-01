import { BookOpen, Sparkles } from "lucide-react";

export type StudyData = {
  title: string;
  summary: string;
  keyConcepts: { term: string; definition: string }[];
  sections: { heading: string; notes: string; bullets: string[] }[];
};

export function StudyGuide({ study }: { study: StudyData }) {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> Summary
        </div>
        <p className="text-base leading-relaxed text-foreground">{study.summary}</p>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="h-4 w-4 text-accent" /> Key concepts
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {study.keyConcepts.map((c, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-semibold text-foreground">{c.term}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.definition}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-semibold">Sections</h2>
        {study.sections.map((s, i) => (
          <article key={i} className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display text-2xl text-foreground">{s.heading}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.notes}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
              {s.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
