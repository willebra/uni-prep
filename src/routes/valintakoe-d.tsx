import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
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
import { ProgressMeter, ModuleProgressBar } from "@/components/progress-meter";

export const Route = createFileRoute("/valintakoe-d")({
  head: () => ({
    meta: [
      {
        title:
          "Uniprep — Valintakoe D, yhteinen osio (psykologia, logopedia, terveys-/hoitotieteet, liikuntabiologia)",
      },
      {
        name: "description",
        content:
          "Harjoittele yliopistojen yhteisvalinnan Valintakoe D:n yhteistä osiota: psykologia, logopedia, terveys-/hoitotieteet ja liikuntabiologia. Opiskelukokonaisuudet M1–M5, pisteytys ja harjoitteet.",
      },
      {
        property: "og:title",
        content: "Uniprep — Valintakoe D, yhteinen osio",
      },
      {
        property: "og:description",
        content:
          "Valmistaudu Valintakoe D:n yhteiseen osioon: psykologia, logopedia, terveys-/hoitotieteet ja liikuntabiologia. Opiskelukokonaisuudet M1–M5 ja harjoitteet.",
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
            icon={<Calendar className="h-4 w-4" />}
            label="Koeajankohta"
            value="3.6.2026"
          />
          <ScoringCard />
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl">Opiskelukokonaisuudet</h2>
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
            <>
              <ProgressMeter
                modules={modules.map((m) => ({
                  id: m.id,
                  title: m.title,
                  total: m.questionCount,
                }))}
              />
              <ol className="mt-4 grid gap-3">
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
                          <span aria-hidden>·</span>
                          <span>{m.questionCount} tehtävää</span>
                        </div>
                        {m.questionCount > 0 ? (
                          <ModuleProgressBar
                            materialId={m.id}
                            total={m.questionCount}
                            className="mt-3"
                          />
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl">Taustamateriaalit</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Kaikki kokeen ennakkomateriaalit sekä viime vuoden koe.
            Ennakkomateriaalit ovat käytettävissä myös itse valintakokeessa.
          </p>

          {["Ennakko- ja harjoittelumateriaalit", "Viime vuoden koe"].map(
            (group) => {
              const groupItems = MATERIALS.filter((m) => m.group === group);
              return (
                <div key={group} className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {group}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {groupItems.map((m) => {
                      const IconComp =
                        m.icon === "exam" ? ClipboardList : FileText;
                      return (
                        <Card
                          key={m.id}
                          className="flex flex-col border-border bg-card shadow-soft transition hover:border-accent/40 hover:shadow-md"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                                <IconComp className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="font-display text-base leading-snug">
                                  {m.title}
                                </CardTitle>
                                <CardDescription className="mt-0.5 text-xs">
                                  {m.source}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-1 flex-col pb-4">
                            <p className="flex-1 text-sm text-muted-foreground">
                              {m.description}
                            </p>
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                            >
                              Avaa PDF
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Materiaalit avautuvat ulkoisilla sivustoilla (Helsingin yliopisto ja
            yliopistovalinnat.fi).
          </p>
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

const MATERIALS: MaterialItem[] = [
  {
    id: "tuki-2026",
    group: "Ennakko- ja harjoittelumateriaalit",
    title: "Ennakkomateriaalin tueksi",
    source: "Tukimateriaali · 2026",
    description:
      "Käsitesanasto, joka selittää kokeen keskeiset tilastolliset ja menetelmälliset käsitteet: efektikoko (Cohenin d, Hedgesin g), luottamusväli ja luottoväli, julkaisuvinouma, tilastollinen voima, RCT, standardointi sekä ehdolliset merkinnät. Käytettävissä myös kokeessa.",
    url: "https://www.helsinki.fi/assets/drupal/2026-06/Ennakkomateriaalin%20tueksi_final_suomi.pdf",
    icon: "file",
  },
  {
    id: "noetel-2024",
    group: "Ennakko- ja harjoittelumateriaalit",
    title: "Noetel ym. (2024): Effect of exercise for depression",
    source: "Tieteellinen artikkeli · BMJ 2024",
    description:
      "Systemaattinen katsaus ja verkkometa-analyysi liikunnan vaikutuksesta masennukseen. Harjoittele luottovälien tulkintaa, annos-vastetta, harhan riskiä ja julkaisuvinoumaa.",
    url: "https://www.helsinki.fi/assets/drupal/2026-06/Noetel%20et%20al.%202024%2C%20Effect%20of%20exercise%20for%20depression.pdf",
    icon: "file",
  },
  {
    id: "simpson-2023",
    group: "Ennakko- ja harjoittelumateriaalit",
    title:
      "Simpson (2023): A Recipe for Disappointment – Policy, Effect Size and the Winner's Curse",
    source: "Tieteellinen artikkeli · 2023",
    description:
      "Efektikoko, mittausvirhe ja 'winner's curse': miksi valikoidut, suurimmat mitatut vaikutukset ovat todennäköisesti yliarvioita, ja miten korjaus tehdään. Kokeen käsitteellisesti vaativin aineisto.",
    url: "https://www.helsinki.fi/assets/drupal/2026-06/Simpson_2023_Policy%20Effect%20Size%20and%20the%20Winner%20s%20Curse.pdf",
    icon: "file",
  },
  {
    id: "koe-2025",
    group: "Viime vuoden koe",
    title: "Valintakoe D 2025 – yhteinen osio",
    source: "Todellinen koe · 2025",
    description:
      "Viime vuoden yhteisen osion koe kokonaisuudessaan. Näyttää kokeen rakenteen (tehtäväkokonaisuudet A1–A5), tehtävätyypit ja pisteytyksen. Hyvä malli harjoitteluun, vaikka ennakkomateriaali vaihtuu vuosittain.",
    url: "https://yliopistovalinnat.fi/wp-content/uploads/2025/06/Valintakoe_D_yhteinen_osio_suomi.pdf",
    icon: "exam",
  },
];

interface MaterialItem {
  id: string;
  group: string;
  title: string;
  source: string;
  description: string;
  url: string;
  icon: "file" | "exam";
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

function ScoringCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft sm:col-span-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Target className="h-4 w-4" />
        Pisteytys
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div>
          <p className="font-medium text-foreground">
            Tosi/epätosi- ja kyllä/ei-kysymykset
          </p>
          <p className="mt-0.5 text-muted-foreground">
            <span className="text-success">oikea +1,1</span>
            <span className="mx-1.5 text-muted-foreground/60">·</span>
            <span className="text-destructive">väärä −0,4</span>
            <span className="mx-1.5 text-muted-foreground/60">·</span>
            <span>vastaamatta −0,2</span>
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground">
            Monivalinta- ja laskutehtävät
          </p>
          <p className="mt-0.5 text-muted-foreground">
            <span className="text-success">oikea +2,2</span>
            <span className="mx-1.5 text-muted-foreground/60">·</span>
            <span className="text-destructive">väärä −0,7</span>
            <span className="mx-1.5 text-muted-foreground/60">·</span>
            <span>vastaamatta −0,2</span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs italic text-muted-foreground">
        Vinkki: myös vastaamatta jättämisestä menettää 0,2 pistettä, joten
        arvaaminen kannattaa useimmiten enemmän kuin tyhjäksi jättäminen.
      </p>
    </div>
  );
}
