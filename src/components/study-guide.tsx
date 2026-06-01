import { useState } from "react";
import { BookOpen, Sparkles, ChevronDown, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type Kouluaste = "lukio" | "syventävä" | "perustaso";

export type KeyConcept = {
  term: string;
  definition: string;
  source?: string;
  official?: string;
  plain?: string;
  example?: string;
  kouluaste?: Kouluaste;
  link?: { label: string; url: string };
};

export type StudyData = {
  title: string;
  summary: string;
  keyConcepts: KeyConcept[];
  sections: { heading: string; notes: string; bullets: string[] }[];
};

const KOULUASTE_STYLES: Record<
  Kouluaste,
  { label: string; className: string }
> = {
  lukio: {
    label: "Lukiotasoa",
    className:
      "border-success/30 bg-success/10 text-success",
  },
  syventävä: {
    label: "Syventävä",
    className: "border-accent/60 bg-accent/20 text-foreground",
  },
  perustaso: {
    label: "Perusasia",
    className: "border-border bg-muted text-foreground",
  },
};

function KouluasteBadge({ value }: { value: Kouluaste }) {
  const s = KOULUASTE_STYLES[value];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}

function ConceptCard({ c }: { c: KeyConcept }) {
  const [open, setOpen] = useState(false);
  const hasExpand = Boolean(c.official || c.plain || c.example || c.link);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{c.term}</div>
          <div className="mt-1 text-sm text-muted-foreground">{c.definition}</div>
        </div>
        {c.kouluaste ? <KouluasteBadge value={c.kouluaste} /> : null}
      </div>

      {hasExpand ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            Lisätietoa
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>

          {open ? (
            <div className="mt-3 space-y-3 rounded-md border border-border bg-background/60 p-3">
              {c.official ? (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Virallinen määritelmä
                    {c.source ? (
                      <span className="ml-1 font-normal normal-case text-muted-foreground/80">
                        · {c.source}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {c.official}
                  </p>
                </div>
              ) : null}

              {c.plain ? (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Selitettynä
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {c.plain}
                  </p>
                  {c.example ? (
                    <p className="mt-1 text-sm italic leading-relaxed text-muted-foreground">
                      Esim. {c.example}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {c.link ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={c.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground shadow-sm transition hover:bg-accent/90"
                  >
                    Syventävä linkki
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-[11px] text-muted-foreground">
                    ei kokeessa
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

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

        <div className="mb-3 flex items-start gap-2 rounded-lg border border-border bg-card/60 p-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          <p>
            <span className="font-semibold text-success">Vihreä</span> = lukiosta tuttua,{" "}
            <span className="font-semibold text-accent-foreground">oranssi</span> = yliopistotason
            syventävää (ennakkomateriaali on tarkoituksella vaativaa). Syventävät linkit ovat
            oppimisen apuna — eivät kuulu kokeeseen.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {study.keyConcepts.map((c, i) => (
            <ConceptCard key={i} c={c} />
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
