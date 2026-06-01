import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const StudySchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyConcepts: z.array(z.object({ term: z.string(), definition: z.string() })),
  sections: z.array(
    z.object({
      heading: z.string(),
      notes: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
});

const QuestionsSchema = z.object({
  questions: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("mcq"),
        prompt: z.string(),
        choices: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string(),
        sourceRef: z.string(),
      }),
      z.object({
        type: z.literal("short"),
        prompt: z.string(),
        modelAnswer: z.string(),
        keywords: z.array(z.string()),
        explanation: z.string(),
        sourceRef: z.string(),
      }),
    ]),
  ),
});

export const createMaterial = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        title: z.string().max(200).optional(),
        text: z.string().min(50).max(60000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const truncated = data.text.slice(0, 60000);

    const [studyRes, questionsRes] = await Promise.all([
      generateText({
        model,
        output: Output.object({ schema: StudySchema }),
        system:
          "You build concise, exam-ready study guides from raw material. Output well-structured notes. Use the language of the source text.",
        prompt: `Material:\n\n${truncated}\n\nProduce a study guide. Title should be short. Summary <= 6 sentences. 5-12 key concepts. 3-8 sections, each with a paragraph of notes and 3-6 bullets.`,
      }),
      generateText({
        model,
        output: Output.object({ schema: QuestionsSchema }),
        system:
          "You are an exam coach. Generate fair, source-grounded practice questions. Every question must be answerable purely from the provided material.",
        prompt: `Material:\n\n${truncated}\n\nGenerate 12 practice questions: 8 multiple-choice (4 options, exactly one correct) and 4 short-answer. Each question must include a brief explanation and a sourceRef quoting the relevant phrase from the material.`,
      }),
    ]);

    const study = studyRes.output;
    const questions = questionsRes.output.questions;
    const title = data.title?.trim() || study.title || "Study material";

    const { data: row, error } = await supabaseAdmin
      .from("materials")
      .insert({
        title,
        source_text: truncated,
        study: study as never,
        questions: questions as never,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const getMaterial = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("materials")
      .select("id,title,study,questions,created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found");
    return row;
  });

export const listMaterials = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("materials")
      .select("id,title,study,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((m) => {
      const study = (m.study ?? {}) as {
        summary?: string;
        sections?: unknown[];
        keyConcepts?: unknown[];
      };
      const questions = (m as { questions?: unknown }).questions;
      return {
        id: m.id,
        title: m.title,
        created_at: m.created_at,
        summary: study.summary ?? "",
        sectionCount: Array.isArray(study.sections) ? study.sections.length : 0,
        conceptCount: Array.isArray(study.keyConcepts)
          ? study.keyConcepts.length
          : 0,
        questionCount: Array.isArray(questions) ? questions.length : 0,
      };
    });
  },
);
