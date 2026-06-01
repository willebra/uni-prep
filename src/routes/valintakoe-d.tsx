import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Target,
  Clock,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listMaterials } from "@/lib/study.functions";

export const Route = createFileRoute("/valintakoe-d")({
  head: () => ({
    meta: [
      {
        title:
          "Valintakoe D — Yhteinen osio | Yliopistojen yhteisvalinta",
      },
      {
        name: "description",
        content:
          "Harjoittele Valintakoe D:n yhteistä osiota (psykologia, logopedia, terveys-/hoitotieteet, liikuntabiologia). Opiskelukokonaisuudet M1–M5 ja harjoitteet.",
      },
      {
        property: "og:title",
        content: "Valintakoe D — Yhteinen osio",
      },
      {
        property: "og:description",
        content:
          "Opiskelukokonaisuudet M1–M5 ja koetehtävät yliopistojen yhteisvalinnan Valintakoe D:n yhteiseen osioon.",
      },
    ],
  }),
  component: ValintakoeDPage,
});

function ValintakoeDPage() {
  const list = useServerFn(listMaterials);
  const { data, isLoading, error } = useQuery({
    queryKey: ["materials"],
    queryFn: () => list(),
  });

  // Order modules M1..M5 by title prefix
  const modules = (data ?? [])
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title, "fi"));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Etusivu
          </Link>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-accent" />
            <span className="truncate text-sm font-semibold">
              Valintakoe D — Yhteinen osio
            </span>
          </div>
          <span className="w-16" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <Target className="h-3.5 w-3.5 text-accent" />
          Yliopistojen yhteisvalinta
        </div>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          Valintakoe D —{" "}
          <span className="italic text-accent">Yhteinen osio</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Psykologia, logopedia, terveys-/hoitotieteet sekä
          liikuntabiologia/valmennustiede. Tämä osio kattaa kaikille yhteisen
          tutkimusmenetelmäaineiston ja siihen liittyvät tehtävät.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <InfoCard
            icon={<Clock className="h-4 w-4" />}
            label="Kesto"
            value="3 tuntia"
          />
          <InfoCard
            icon={<ListChecks className="h-4 w-4" />}
            label="Opiskelukokonaisuudet"
            value="5 (M1–M5)"
          />
          <InfoCard
            icon={<Target className="h-4 w-4" />}
            label="Pisteytys"
            value="+1,1 / −0,4 ja +2,2 / −0,7"
          />
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl">Opiskelukokonaisuudet</h2>
            <span className="text-xs text-muted-foreground">
              Etenemismittari tulossa
            </span>
          </div>

          {isLoading ? (
            <div className="grid place-items-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              Sisältöä ei voitu ladata. Yritä päivittää sivu.
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Opiskelukokonaisuuksia ei vielä löytynyt.
            </p>
          ) : (
            <ol className="grid gap-3">
              {modules.map((m, i) => (
                <li key={m.id}>
                  <Link
                    to="/m/$id"
                    params={{ id: m.id }}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-accent/60 hover:shadow-md"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-sm font-semibold text-foreground">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-xl leading-tight">
                          {m.title}
                        </h3>
                        <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                      </div>
                      {m.summary ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {m.summary}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{m.sectionCount} osiota</span>
                        <span aria-hidden>·</span>
                        <span>{m.conceptCount} käsitettä</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" />
            <h2 className="font-display text-xl">Kokeen perustiedot</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              Aineisto julkaistaan 2 vuorokautta ennen koetta. Tämä sivusto
              auttaa rakentamaan aineistosta opiskeltavan kokonaisuuden ja
              harjoittelemaan koetyyppisiä tehtäviä.
            </li>
            <li>
              Tehtävätyypit kattavat oikein/väärin -väittämät (T2),
              monivalinnat (T3), numeeriset vastaukset (T4) sekä
              aineistotehtävät (T5). Pisteytys noudattaa virallista kaavaa.
            </li>
            <li>
              Etene moduuli kerrallaan järjestyksessä M1 → M5 tai valitse
              haluamasi osio.
            </li>
          </ul>
        </section>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">Takaisin etusivulle</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-lg leading-tight">{value}</div>
    </div>
  );
}
