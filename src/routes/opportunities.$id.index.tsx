import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OPPORTUNITIES } from "@/lib/skillbridge";

export const Route = createFileRoute("/opportunities/$id/")({
  loader: ({ params }) => {
    const o = OPPORTUNITIES.find((x) => x.id === params.id);
    if (!o) throw notFound();
    return o;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Opportunity"} — SkillBridge Lite` },
      { name: "description", content: loaderData?.description ?? "Opportunity details." },
      { property: "og:title", content: `${loaderData?.title ?? "Opportunity"} — SkillBridge Lite` },
      { property: "og:description", content: loaderData?.description ?? "Opportunity details." },
    ],
  }),
  component: Details,
});

function Details() {
  const o = Route.useLoaderData();
  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/opportunities" className="text-sm text-muted-foreground hover:text-foreground">← All opportunities</Link>
      <div className="mt-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">{o.company}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{o.title}</h1>
        <p className="mt-4 text-muted-foreground">{o.description}</p>
        <h2 className="mt-8 font-semibold">Required skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {o.skills.map((s) => (
            <span key={s} className="rounded-full bg-secondary px-3 py-1 text-sm">{s}</span>
          ))}
        </div>
        <h2 className="mt-8 font-semibold">Responsibilities</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
          {o.responsibilities.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <Button asChild size="lg" className="mt-8">
          <Link to="/opportunities/$id/analysis" params={{ id: o.id }}>Analyze My Fit</Link>
        </Button>
      </div>
    </section>
  );
}
