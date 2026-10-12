import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AI_SERVICE_CONFIGURED,
  OPPORTUNITIES,
  demoPreview,
  hasEnoughData,
  useProfile,
} from "@/lib/skillbridge";

export const Route = createFileRoute("/opportunities/$id/analysis")({
  loader: ({ params }) => {
    const o = OPPORTUNITIES.find((x) => x.id === params.id);
    if (!o) throw notFound();
    return o;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Fit Analysis: ${loaderData?.title ?? "Opportunity"} — SkillBridge Lite` },
      { name: "description", content: "See relevant skills, potential gaps, and next steps." },
      { property: "og:title", content: "AI Fit Analysis — SkillBridge Lite" },
      { property: "og:description", content: "See relevant skills, potential gaps, and next steps." },
    ],
  }),
  component: Analysis,
});

type State = "loading" | "insufficient" | "unavailable" | "error";

function Analysis() {
  const o = Route.useLoaderData();
  const { profile, isSample } = useProfile();
  const [state, setState] = useState<State>("loading");
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    setState("loading");
    const t = setTimeout(() => {
      try {
        if (!hasEnoughData(profile)) setState("insufficient");
        else if (!AI_SERVICE_CONFIGURED) setState("unavailable");
        else setState("error");
      } catch {
        setState("error");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [profile]);

  const demo = demoPreview(profile, o);

  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/opportunities/$id" params={{ id: o.id }} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to {o.title}
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">AI Fit Analysis</h1>
      <p className="mt-2 text-muted-foreground">
        {o.title} at {o.company} · Profile: {profile.name || "Unnamed"}
        {isSample && " (sample profile)"}
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        {state === "loading" && <p className="text-muted-foreground" role="status">Checking your profile…</p>}
        {state === "insufficient" && (
          <Notice title="Not enough profile information">
            Add your skills and at least one project or experience entry to analyze your fit.
            <Button asChild className="mt-4 block w-fit"><Link to="/profile">Complete My Profile</Link></Button>
          </Notice>
        )}
        {state === "unavailable" && (
          <Notice title="Real AI analysis is currently unavailable">
            No AI service is configured for this app, so no real AI analysis has been performed.
            {!showDemo && (
              <Button variant="outline" className="mt-4 block w-fit" onClick={() => setShowDemo(true)}>
                Show demonstration example
              </Button>
            )}
          </Notice>
        )}
        {state === "error" && (
          <Notice title="Something went wrong">
            The analysis could not be completed. Please try again later.
          </Notice>
        )}
      </div>

      {state === "unavailable" && showDemo && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-primary/40 p-6">
          <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Demonstration example — not a real AI analysis
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            This preview only matches required skill names against words in your profile.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Section title="Relevant Skills" items={demo.relevant} empty="No matching skills found." />
            <Section title="Potential Gaps" items={demo.gaps} empty="No gaps found." />
            <Section title="Recommended Next Steps" items={demo.steps} empty="Keep your profile up to date." />
          </div>
        </div>
      )}
    </section>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((i) => <li key={i}>{i}</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}
