import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ProfileInput = z.object({
  name: z.string().max(200),
  headline: z.string().max(500),
  about: z.string().max(5000),
  skills: z.string().max(5000),
  projects: z.string().max(10000),
  experience: z.string().max(10000),
});
const OpportunityInput = z.object({
  id: z.string(),
  title: z.string().max(300),
  company: z.string().max(300),
  description: z.string().max(5000),
  skills: z.array(z.string().max(200)).max(50),
  responsibilities: z.array(z.string().max(500)).max(50),
});

export const FitAnalysisSchema = z
  .object({
    relevantSkills: z.array(
      z.object({ item: z.string().min(1), evidence: z.string().min(1), relevance: z.string().min(1) }).strict(),
    ),
    potentialGaps: z.array(z.object({ requirement: z.string().min(1), reason: z.string().min(1) }).strict()),
    recommendedNextSteps: z.array(z.object({ action: z.string().min(1), reason: z.string().min(1) }).strict()),
  })
  .strict();
export type FitAnalysis = z.infer<typeof FitAnalysisSchema>;

export type FitAnalysisResponse =
  | { ok: true; result: FitAnalysis }
  | { ok: false; code: "unavailable" | "invalid_output" | "rate_limited" | "credits" | "error"; message: string };

const strObj = (props: string[]) => ({
  type: "object",
  additionalProperties: false,
  required: props,
  properties: Object.fromEntries(props.map((p) => [p, { type: "string" }])),
});
const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["relevantSkills", "potentialGaps", "recommendedNextSteps"],
  properties: {
    relevantSkills: { type: "array", items: strObj(["item", "evidence", "relevance"]) },
    potentialGaps: { type: "array", items: strObj(["requirement", "reason"]) },
    recommendedNextSteps: { type: "array", items: strObj(["action", "reason"]) },
  },
};

const INSTRUCTIONS = `You are SkillBridge Lite's career fit analyst. Compare the candidate's profile with the opportunity.
Rules:
- Use ONLY information stated in the supplied profile and opportunity. Never invent skills, qualifications, projects, or experience.
- relevantSkills: each item is a skill or capability the opportunity asks for that the profile supports; "evidence" must quote or closely paraphrase where the profile shows it; "relevance" explains why it matters for this opportunity.
- potentialGaps: opportunity requirements not evidenced in the profile. In "reason", distinguish "not mentioned in the profile (missing evidence)" from a confirmed lack of skill — only call it a confirmed lack if the profile explicitly says so.
- recommendedNextSteps: concrete, realistic actions to strengthen the application or close gaps, each with a reason.
- Never guarantee or predict hiring outcomes.
- Return arrays (possibly empty) and nothing else.`;

export const analyzeFit = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ profile: ProfileInput, opportunity: OpportunityInput }).parse(d))
  .handler(async ({ data }): Promise<FitAnalysisResponse> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, code: "unavailable", message: "The AI service is not configured." };

    const input = `PROFILE:\n${JSON.stringify(data.profile, null, 2)}\n\nOPPORTUNITY:\n${JSON.stringify(
      { ...data.opportunity, id: undefined },
      null,
      2,
    )}`;

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions: INSTRUCTIONS,
          input,
          stream: true,
          store: false,
          reasoning: { effort: "low" },
          text: { format: { type: "json_schema", name: "fit_analysis", strict: true, schema: JSON_SCHEMA } },
        }),
      });
    } catch {
      return { ok: false, code: "unavailable", message: "Could not reach the AI service." };
    }

    if (!res.ok || !res.body) {
      let msg = "";
      try {
        msg = (await res.json())?.message ?? "";
      } catch {}
      console.error("AI gateway error", res.status, msg);
      if (res.status === 429) return { ok: false, code: "rate_limited", message: "The AI service is busy. Please wait a moment and try again." };
      if (res.status === 402) return { ok: false, code: "credits", message: msg || "AI credits are used up for this workspace." };
      if (res.status === 401 || res.status === 403 || res.status === 404 || res.status >= 500)
        return { ok: false, code: "unavailable", message: msg || "The AI service is currently unavailable." };
      return { ok: false, code: "error", message: "The analysis request could not be completed." };
    }

    // Consume the SSE stream server-side and accumulate output text.
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    let failed = false;
    let refused = false;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
            else if (ev.type === "response.refusal.delta") refused = true;
            else if (ev.type === "response.failed" || ev.type === "error") failed = true;
          } catch {}
        }
      }
    }

    if (refused) return { ok: false, code: "error", message: "The AI service declined to analyze this request." };
    if (failed) return { ok: false, code: "unavailable", message: "The AI service failed to complete the analysis." };

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, code: "invalid_output", message: "The AI returned a response that could not be read." };
    }
    const v = FitAnalysisSchema.safeParse(parsed);
    if (!v.success) return { ok: false, code: "invalid_output", message: "The AI returned an incomplete analysis." };
    return { ok: true, result: v.data };
  });
