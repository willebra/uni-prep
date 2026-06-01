import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, ArrowLeft, Share2, Dumbbell, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getMaterial } from "@/lib/study.functions";
import { StudyGuide, type StudyData } from "@/components/study-guide";
import { TrainMode, type Question } from "@/components/train-mode";

export const Route = createFileRoute("/m/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Study pack — Uniprep` },
      { name: "description", content: "AI-generated study guide and practice questions." },
      { property: "og:title", content: `Study pack ${params.id.slice(0, 8)} — Uniprep` },
    ],
  }),
  component: MaterialPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="text-xl font-semibold">Couldn't load this pack</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-xl font-semibold">Pack not found</h1>
      <Button asChild className="mt-4">
        <Link to="/">Go home</Link>
      </Button>
    </div>
  ),
});

function MaterialPage() {
  const { id } = Route.useParams();
  const fetchMaterial = useServerFn(getMaterial);
  const { data, isLoading, error } = useQuery({
    queryKey: ["material", id],
    queryFn: () => fetchMaterial({ data: { id } }),
  });

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading your pack…
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="grid min-h-screen place-items-center p-10 text-center">
        <div>
          <h1 className="text-xl font-semibold">Couldn't load this pack</h1>
          <Button asChild className="mt-4">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const study = data.study as unknown as StudyData;
  const questions = (data.questions as unknown as Question[]) ?? [];

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: data!.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> New pack
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" />
            <span className="truncate text-sm font-semibold">{data.title}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={share}>
            <Share2 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Share</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="font-display text-4xl leading-tight md:text-5xl">{data.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Generated {new Date(data.created_at).toLocaleString()}
        </p>

        <Tabs defaultValue="study" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 md:w-fit">
            <TabsTrigger value="study">
              <FileText className="mr-2 h-4 w-4" /> Study guide
            </TabsTrigger>
            <TabsTrigger value="train">
              <Dumbbell className="mr-2 h-4 w-4" /> Train ({questions.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="study" className="mt-6">
            <StudyGuide study={study} />
          </TabsContent>
          <TabsContent value="train" className="mt-6">
            {questions.length > 0 ? (
              <TrainMode materialId={id} questions={questions} />
            ) : (
              <p className="text-muted-foreground">No questions were generated.</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
